import { useState } from 'react';
import React from 'react';
import {
  Icon2fa,
  IconBellRinging,
  IconClipboard,
  IconClipboardCheckFilled,
  IconClipboardData,
  IconClipboardList,
  IconDatabaseImport,
  IconFile,
  IconFingerprint,
  IconHome,
  IconKey,
  IconLogout,
  IconReceipt2,
  IconSettings,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import Link from 'next/link';
import classes from '@/styles/sidePanel.module.css';

const data = [
  { link: '/home/', label: 'Main', icon: IconHome },
  { link: '/home/resume_builder', label: 'Upload File', icon: IconFile },
  { link: '', label: 'Continue Editing', icon: IconClipboardList },
  { link: '', label: 'Completed Resumes', icon: IconClipboardCheckFilled },
  { link: '/home/settings', label: 'Other Settings', icon: IconSettings },
];

interface SidePanelProps {
  hidden?: boolean;
}

export default function SidePanel({ hidden }: SidePanelProps) {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
    <Link
      href={item.link || '#'}
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      onClick={() => setActive(item.label)}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <nav className={classes.navbar}
      style={{display: hidden ? "none" : undefined}}
    >
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <MantineLogo size={28} />
          <Code fw={700}>v3.1.2</Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}