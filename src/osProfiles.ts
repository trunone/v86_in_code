export interface OSProfile {
    id: string;
    name: string;
    description: string;
    category: 'linux' | 'dos' | 'other' | 'custom';
    cdromUrl?: string;
    fdaUrl?: string;
    hdaUrl?: string;
    bzimageUrl?: string;
    initrdUrl?: string;
    cmdline?: string;
    memoryMB?: number;
    vgaMemoryMB?: number;
}

export const OS_PRESETS: Record<string, OSProfile> = {
    archlinux: {
        id: 'archlinux',
        name: 'Arch Linux x86',
        description: 'Lightweight Linux distribution booted with kernel and initrd',
        category: 'linux',
        bzimageUrl: 'https://copy.sh/v86/images/bzImage',
        initrdUrl: 'https://copy.sh/v86/images/rootfs.cpio.zst',
        cmdline: 'console=ttyS0 root=/dev/ram0 rw quiet',
        memoryMB: 512,
        vgaMemoryMB: 8
    },
    alpine: {
        id: 'alpine',
        name: 'Alpine Linux x86',
        description: 'Security-oriented, lightweight Linux distribution based on musl & busybox',
        category: 'linux',
        bzimageUrl: 'https://copy.sh/v86/images/alpine-bzImage',
        initrdUrl: 'https://copy.sh/v86/images/alpine-initrd.img',
        cmdline: 'console=ttyS0 alpine_repo=https://dl-cdn.alpinelinux.org/alpine/v3.18/main',
        memoryMB: 256,
        vgaMemoryMB: 8
    },
    freedos: {
        id: 'freedos',
        name: 'FreeDOS 1.2',
        description: 'Free and open source DOS-compatible operating system',
        category: 'dos',
        fdaUrl: 'https://copy.sh/v86/images/freedos722.img',
        memoryMB: 32,
        vgaMemoryMB: 4
    },
    kolibrios: {
        id: 'kolibrios',
        name: 'KolibriOS',
        description: 'Tiny & fast assembly-written graphical operating system',
        category: 'other',
        fdaUrl: 'https://copy.sh/v86/images/kolibri.img',
        memoryMB: 128,
        vgaMemoryMB: 8
    },
    custom: {
        id: 'custom',
        name: 'Custom Image / ISO',
        description: 'User configured ISO or disk image',
        category: 'custom',
        memoryMB: 512,
        vgaMemoryMB: 8
    }
};
