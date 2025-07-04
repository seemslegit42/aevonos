import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Avatar>
      <AvatarImage src="https://placehold.co/100x100.png" alt="@aevon" data-ai-hint="avatar" />
      <AvatarFallback>AV</AvatarFallback>
    </Avatar>
  ),
};
