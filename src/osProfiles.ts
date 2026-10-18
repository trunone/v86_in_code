export interface OSProfile {
    id: string;
    name: string;
    description: string;
    category: 'linux' | 'dos' | 'other' | 'custom';
    initialStateUrl?: string;
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
        description: 'Arch Linux x86 environment booted from state image',
        category: 'linux',
        initialStateUrl: 'https://c.copy.sh/arch_state-v3.bin.zst',
        memoryMB: 512,
        vgaMemoryMB: 8
    },
    alpine: {
        id: 'alpine',
        name: 'Buildroot / Alpine Linux x86',
        description: 'Lightweight Linux distribution booted with kernel bzImage',
        category: 'linux',
        bzimageUrl: 'https://c.copy.sh/buildroot-bzimage.bin',
        cmdline: 'tsc=reliable mitigations=off random.trust_cpu=on',
        memoryMB: 256,
        vgaMemoryMB: 8
    },
    freedos: {
        id: 'freedos',
        name: 'FreeDOS 1.2',
        description: 'Free and open source DOS-compatible operating system',
        category: 'dos',
        fdaUrl: 'https://c.copy.sh/freedos722.img',
        memoryMB: 32,
        vgaMemoryMB: 4
    },
    kolibrios: {
        id: 'kolibrios',
        name: 'KolibriOS',
        description: 'Tiny & fast assembly-written graphical operating system',
        category: 'other',
        fdaUrl: 'https://c.copy.sh/kolibri.img',
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
