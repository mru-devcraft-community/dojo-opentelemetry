import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FadeInView from './FadeInView';

interface StackTabsProps {
  dotnet: React.ReactNode;
  java: React.ReactNode;
}

export default function StackTabs({ dotnet, java }: StackTabsProps) {
  return (
    <FadeInView direction="up" duration={0.4}>
      <div className="stack-tabs-wrapper">
        <Tabs groupId="stack" defaultValue="dotnet" values={[
          { label: '⚡ .NET 10 / Aspire', value: 'dotnet' },
          { label: '☕ Java 21 / Spring Boot', value: 'java' },
        ]}>
          <TabItem value="dotnet">{dotnet}</TabItem>
          <TabItem value="java">{java}</TabItem>
        </Tabs>
      </div>
    </FadeInView>
  );
}
