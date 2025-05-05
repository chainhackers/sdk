import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Cog } from 'lucide-react';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    className: { control: 'text' },
    token: { control: 'object' },
  },
   args: {
     type: 'text',
     placeholder: 'Enter text...',
     disabled: false,
     className: 'w-64',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Default Input',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled Input',
    disabled: true,
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number',
  },
};

export const WithTokenInfo: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    value: '10.5',
    token: {
      icon: <Cog className="h-4 w-4 mr-1 text-orange-500" />,
      symbol: "POL"
    },
  },
};
