import { View, Text, ViewProps } from "react-native";
import { ReactNode } from "react";

interface SettingsCardProps extends ViewProps {
  title: string;
  children: ReactNode;
  titleClassName?: string;
}

export function SettingsCard({ title, children, className = "bg-white", titleClassName = "mb-4", ...props }: SettingsCardProps) {
  return (
    <View 
      className={`rounded-[30px] p-6 mb-4 border border-stone-surface ${className}`}
      {...props}
    >
      <Text className={`font-display font-semibold text-heading-sm text-charcoal-primary tracking-tight ${titleClassName}`}>
        {title}
      </Text>
      {children}
    </View>
  );
}
