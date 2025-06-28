'use client';

import React from 'react';
import type { OsintOutput } from '@/ai/agents/osint-schemas';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BadgeAlert, PhoneOff, Skull, Globe, Linkedin, Twitter as XIcon, Instagram, VenetianMask, FileQuestion } from 'lucide-react';

interface OsintReportPanelProps {
    report: OsintOutput;
}

export default function OsintReportPanel({ report }: OsintReportPanelProps) {
    const socialIcons: Record<string, React.ElementType> = {
        LinkedIn, 'X': XIcon, Instagram, GitHub: FileQuestion, TikTok: VenetianMask, 'Unknown': Globe
    };
    
    return (
        <ScrollArea className="h-96 pr-2">
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold text-primary">Intelligence Summary</h4>
                    <p className="text-xs text-foreground/90">{report.summary}</p>
                </div>
                
                <Separator />

                <div>
                    <h4 className="font-bold text-destructive">Risk Factors</h4>
                    <ul className="text-xs list-disc pl-4 text-destructive/90 space-y-1">
                        {report.riskFactors.map((factor, i) => <li key={i}>{factor}</li>)}
                    </ul>
                </div>
                
                {report.breaches && report.breaches.length > 0 && <Separator />}
                {report.breaches && report.breaches.length > 0 && (
                     <div>
                        <h4 className="font-bold text-yellow-400 flex items-center gap-2"><BadgeAlert /> Data Breaches</h4>
                        <div className="space-y-2 mt-1">
                            {report.breaches.map(breach => (
                                <div key={breach.name} className="text-xs p-2 border border-yellow-400/50 rounded-md bg-background/50">
                                    <p className="font-bold text-yellow-400">{breach.name} ({breach.breachDate})</p>
                                    <p className="text-foreground/80 italic mt-1">{breach.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {report.intelXLeaks && report.intelXLeaks.length > 0 && <Separator />}
                {report.intelXLeaks && report.intelXLeaks.length > 0 && (
                    <div>
                        <h4 className="font-bold text-red-500 flex items-center gap-2"><Skull /> IntelX Leaks</h4>
                        <div className="space-y-2 mt-1">
                            {report.intelXLeaks.map(leak => (
                                <div key={leak.source} className="text-xs p-2 border border-red-500/50 rounded-md bg-background/50">
                                    <p className="font-bold text-red-500">{leak.source} ({leak.date})</p>
                                    <p className="text-foreground/80 italic mt-1">{leak.details}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {report.burnerPhoneCheck && <Separator />}
                {report.burnerPhoneCheck && (
                    <div>
                        <h4 className="font-bold text-orange-400 flex items-center gap-2"><PhoneOff /> Burner Phone Check</h4>
                        <div className="text-xs p-2 border border-orange-400/50 rounded-md bg-background/50">
                            {report.burnerPhoneCheck.isBurner ? (
                                <p>Number is flagged as a <span className="font-bold">burner/VoIP</span> service ({report.burnerPhoneCheck.carrier}).</p>
                            ) : (
                                <p>Number appears to be a standard mobile number from {report.burnerPhoneCheck.carrier}.</p>
                            )}
                        </div>
                    </div>
                )}

                {report.socialProfiles && report.socialProfiles.length > 0 && <Separator />}
                {report.socialProfiles && report.socialProfiles.length > 0 && (
                    <div>
                        <h4 className="font-bold text-primary">Social Media Footprint</h4>
                        <div className="space-y-2 mt-1">
                            {report.socialProfiles.map(profile => {
                                const Icon = socialIcons[profile.platform] || Globe;
                                return (
                                    <div key={profile.username} className="text-xs p-2 border rounded-md bg-background/50">
                                        <div className="flex items-center gap-2 font-bold">
                                            <Icon className="h-4 w-4" />
                                            <span>{profile.platform} - @{profile.username}</span>
                                             <Badge variant="secondary" className="ml-auto text-xs">{profile.followerCount.toLocaleString()} followers</Badge>
                                        </div>
                                        <p className="font-medium text-foreground/80 mt-1">{profile.bio}</p>
                                        <div className="text-foreground/80 italic mt-1">
                                            <p className="font-semibold not-italic text-muted-foreground">Recent Activity:</p>
                                            <ul className="list-disc pl-4">
                                                {profile.recentPosts.map((post, i) => <li key={i}>{post}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
};