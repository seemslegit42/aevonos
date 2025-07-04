
import { getPulseProfile, getCurrentPulseValue, recordWin, recordLoss, shouldTriggerPityBoon, recordInteraction } from './pulse-engine-service';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { PulseProfile, PulsePhase, PulseInteractionType } from '@prisma/client';
import { getPulseEngineConfig } from '@/services/config-service';

// Mock prisma, cache, and config service
jest.mock('@/lib/prisma', () => ({
  pulseProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/lib/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock('@/services/config-service');

const mockGetPulseEngineConfig = getPulseEngineConfig as jest.Mock;


describe('Pulse Engine Service', () => {
  const mockUserId = 'user-test-id';
  const mockWorkspaceId = 'ws-test-id';
  let mockProfile: PulseProfile;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    mockProfile = {
      id: 'profile-id',
      userId: mockUserId,
      amplitude: 0.1,
      frequency: 0.01,
      phaseOffset: 0,
      baselineLuck: 0.5,
      lastEventTimestamp: new Date('2024-01-01T12:00:00Z'),
      consecutiveLosses: 0,
      frustration: 0.1,
      flowState: 0.2,
      riskAversion: 0.5,
      lastResolvedPhase: PulsePhase.EQUILIBRIUM,
      lastInteractionType: null,
      nextTributeGuaranteedWin: false,
      loadedDieBuffCount: 0,
      hadesBargainActive: false,
    };

    // Mock the config service to return a default pity threshold
    mockGetPulseEngineConfig.mockResolvedValue({ pityThreshold: 5 });
  });
  
  describe('getPulseProfile', () => {
    it('should return a cached profile if it exists', async () => {
      (cache.get as jest.Mock).mockResolvedValue(mockProfile);
      const profile = await getPulseProfile(mockUserId);
      expect(profile).toEqual(mockProfile);
      expect(prisma.pulseProfile.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from db and cache if not in cache', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      (prisma.pulseProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      const profile = await getPulseProfile(mockUserId);
      expect(profile).toEqual(mockProfile);
      expect(prisma.pulseProfile.findUnique).toHaveBeenCalledWith({ where: { userId: mockUserId } });
      expect(cache.set).toHaveBeenCalledWith(`pulse-profile:${mockUserId}`, mockProfile, expect.any(String), expect.any(Number));
    });

    it('should create a new profile if none exists', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      (prisma.pulseProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.pulseProfile.create as jest.Mock).mockResolvedValue(mockProfile); // Return a mock profile on creation
      await getPulseProfile(mockUserId);
      expect(prisma.pulseProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: mockUserId })
      });
    });
  });

  describe('getCurrentPulseValue', () => {
    it('should calculate a luck value within the range [0.05, 0.95]', async () => {
      (cache.get as jest.Mock).mockResolvedValue(mockProfile);
      const pulseValue = await getCurrentPulseValue(mockUserId);
      expect(pulseValue).toBeGreaterThanOrEqual(0.05);
      expect(pulseValue).toBeLessThanOrEqual(0.95);
    });
  });

  describe('recordWin', () => {
    it('should reset consecutiveLosses and update psychological state', async () => {
      mockProfile.consecutiveLosses = 5;
      mockProfile.frustration = 0.5;
      (cache.get as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.pulseProfile.update as jest.Mock).mockResolvedValue({ ...mockProfile, consecutiveLosses: 0, frustration: 0.3, flowState: 0.3 });

      await recordWin(mockUserId);

      expect(prisma.pulseProfile.update).toHaveBeenCalledWith({
        where: { id: mockProfile.id },
        data: {
          lastEventTimestamp: expect.any(Date),
          consecutiveLosses: 0,
          lastResolvedPhase: expect.any(String),
          lastInteractionType: PulseInteractionType.WIN,
          frustration: expect.any(Number),
          flowState: expect.any(Number),
        },
      });
    });
  });
  
   describe('recordLoss', () => {
    it('should increment consecutiveLosses and update psychological state', async () => {
      (cache.get as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.pulseProfile.update as jest.Mock).mockResolvedValue({ ...mockProfile, consecutiveLosses: 1 });

      await recordLoss(mockUserId);

      expect(prisma.pulseProfile.update).toHaveBeenCalledWith({
        where: { id: mockProfile.id },
        data: {
          lastEventTimestamp: expect.any(Date),
          consecutiveLosses: { increment: 1 },
          lastResolvedPhase: expect.any(String),
          lastInteractionType: PulseInteractionType.LOSS,
          frustration: expect.any(Number),
          flowState: expect.any(Number),
        },
      });
    });
  });

  describe('shouldTriggerPityBoon', () => {
    it('should return true if consecutive losses are over the threshold', async () => {
      mockProfile.consecutiveLosses = 5;
      (cache.get as jest.Mock).mockResolvedValue(mockProfile);
      const result = await shouldTriggerPityBoon(mockUserId, mockWorkspaceId);
      expect(result).toBe(true);
      expect(mockGetPulseEngineConfig).toHaveBeenCalledWith(mockWorkspaceId);
    });

    it('should return false if consecutive losses are under the threshold', async () => {
      mockProfile.consecutiveLosses = 4;
      (cache.get as jest.Mock).mockResolvedValue(mockProfile);
      const result = await shouldTriggerPityBoon(mockUserId, mockWorkspaceId);
      expect(result).toBe(false);
      expect(mockGetPulseEngineConfig).toHaveBeenCalledWith(mockWorkspaceId);
    });
  });

  describe('recordInteraction', () => {
    it('should decrease frustration on success', async () => {
        (prisma.pulseProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
        await recordInteraction(mockUserId, 'success');
        expect(prisma.pulseProfile.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ frustration: Math.max(0, mockProfile.frustration - 0.02)})
            })
        );
    });

     it('should increase frustration on failure', async () => {
        (prisma.pulseProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
        await recordInteraction(mockUserId, 'failure');
        expect(prisma.pulseProfile.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ frustration: Math.min(1, mockProfile.frustration + 0.05)})
            })
        );
    });
  });

});
