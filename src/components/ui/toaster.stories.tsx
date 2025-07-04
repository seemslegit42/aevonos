import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from './toaster';
import React from 'react';

const meta: Meta = {
  title: 'UI/Toaster',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
};

export default meta;

const ToastExample = () => {
    const { toast } = useToast();
  
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => {
            toast({
              title: 'Scheduled: Catch up',
              description: 'Friday, February 10, 2023 at 5:57 PM',
            });
          }}
        >
          Show Toast
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
            });
          }}
        >
          Show Destructive Toast
        </Button>
      </div>
    );
  };

export const Default: StoryObj = {
    render: () => <ToastExample />,
};
