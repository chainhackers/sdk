import React from "react";

interface TeamMemberProps {
  name: string;
  role: string;
  icon: React.ReactNode;
  description: string;
  iconColor: string;
}

export const TeamMember: React.FC<TeamMemberProps> = ({ role, icon, description, iconColor }) => {
  return (
    <div className="border rounded-lg p-6 bg-card text-card-foreground">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
        <h3 className="text-xl font-semibold">{role}</h3>
      </div>
      <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};
