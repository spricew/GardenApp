import { View, Text, ViewProps } from "react-native";
import { ReactNode } from "react";

interface CardProps extends ViewProps {
  title?: string;
  children: ReactNode;
  titleClassName?: string;
  extraClassName?: string;
}

export function Card({ title, children, extraClassName = "", titleClassName = "mb-4", style, ...props }: CardProps) {
  return (
    <View 
      className={`rounded-[30px] p-6 border border-stone-surface bg-white overflow-hidden ${extraClassName}`}
      style={[{ borderCurve: "continuous" }, style]}
      {...props}
    >
      {title && (
        <Text className={`font-sans font-semibold text-[19px] text-charcoal-primary tracking-tight ${titleClassName}`}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
