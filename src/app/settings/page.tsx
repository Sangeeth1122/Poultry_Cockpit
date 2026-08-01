'use client';

import React from 'react';
import { SettingsModule } from '../../components/settings/SettingsModule';
import { useApp } from '../../context/AppContext';

export default function SettingsPage() {
  const {
    farms,
    sheds,
    userRole,
    userId,
    handleFarmCreated,
    handleShedCreated,
  } = useApp();

  return (
    <SettingsModule
      farms={farms}
      sheds={sheds}
      userRole={userRole}
      userId={userId}
      onFarmCreated={handleFarmCreated}
      onShedCreated={handleShedCreated}
    />
  );
}
