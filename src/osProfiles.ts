export interface OSProfile {
    id: string;
    name: string;
    description: string;
    category: 'linux' | 'dos' | 'other' | 'custom';
    initialStatePath?: string;
    cdromPath?: string;
    fdaPath?: string;
    hdaPath?: string;
    bzimagePath?: string;
    initrdPath?: string;
    cmdline?: string;
    memoryMB?: number;
    vgaMemoryMB?: number;
}

export const OS_PRESETS: Record<string, OSProfile> = {
    archlinux: {
        id: 'archlinux',
        name: 'Arch Linux x86',
        description: 'Arch Linux x86 environment booted from pre-built state image',
        category: 'linux',
        initialStatePath: 'media/images/arch_state-v3.bin.zst',
        memoryMB: 512,
        vgaMemoryMB: 8
    },
    alpine: {
        id: 'alpine',
        name: 'Buildroot Linux x86',
        description: 'Lightweight Linux distribution booted with kernel bzImage',
        category: 'linux',
        bzimagePath: 'media/images/buildroot-bzimage.bin',
        cmdline: 'tsc=reliable mitigations=off random.trust_cpu=on',
        memoryMB: 256,
        vgaMemoryMB: 8
    },
    freedos: {
        id: 'freedos',
        name: 'FreeDOS 1.2',
        description: 'Free and open source DOS-compatible operating system',
        category: 'dos',
        fdaPath: 'media/images/freedos722.img',
        memoryMB: 32,
        vgaMemoryMB: 4
    },
    kolibrios: {
        id: 'kolibrios',
        name: 'KolibriOS',
        description: 'Tiny & fast assembly-written graphical operating system',
        category: 'other',
        fdaPath: 'media/images/kolibri.img',
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
