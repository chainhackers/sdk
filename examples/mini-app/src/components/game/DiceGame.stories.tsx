import type { Meta, StoryObj } from '@storybook/react';
import { DiceGame } from './DiceGame';

const meta = {
  title: 'Game/DiceGame',
  component: DiceGame,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: 'oklch(0.15 0 0)' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'radio',
      options: ['light', 'dark', 'system'],
    },
  }
} satisfies Meta<typeof DiceGame>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: Story = {
  render: (args) => <DiceGame {...args} />,
};

export const LightTheme: Story = {
  ...Template,
  args: {
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  ...Template,
  args: {
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const SystemTheme: Story = {
   ...Template,
   args: {
     theme: 'system',
   },
 };
