
export interface Donation {
    id: number;
    user_name: string;
    user_email?: string | null;
    user_url?: string | null;
    user_message?: string | null;
    amount: number;
    payment_method: string;
    status: string;
    created_at: Date | string;
    reply_content?: string;
    reply_at?: Date | string;
}

export interface MergedDonor {
    id: string; // Composite ID or the ID of the primary donor
    user_name: string;
    user_email?: string;
    user_url?: string;
    total_amount: number;
    donation_count: number;
    last_donation_at: string;
    donations: Donation[]; // Keep track of original donations
}

export function mergeDonors(donations: Donation[]): MergedDonor[] {
    const adj = new Map<string, Set<string>>();
    const nodes = new Set<string>();
    const donationMap = new Map<string, Donation[]>();

    // Helper to add edge
    const addEdge = (u: string, v: string) => {
        if (!adj.has(u)) adj.set(u, new Set());
        if (!adj.has(v)) adj.set(v, new Set());
        adj.get(u)!.add(v);
        adj.get(v)!.add(u);
        nodes.add(u);
        nodes.add(v);
    };

    // Build graph
    donations.forEach((d, index) => {
        const idNode = `id:${d.id}`;
        nodes.add(idNode);

        if (!donationMap.has(idNode)) {
            donationMap.set(idNode, []);
        }
        donationMap.get(idNode)!.push(d);

        // Connect by Name
        if (d.user_name) {
            const nameNode = `name:${d.user_name.trim().toLowerCase()}`;
            addEdge(idNode, nameNode);
        }

        // Connect by Email
        if (d.user_email) {
            const emailNode = `email:${d.user_email.trim().toLowerCase()}`;
            addEdge(idNode, emailNode);
        }
    });

    const visited = new Set<string>();
    const groups: Donation[][] = [];

    // Find connected components
    for (const node of nodes) {
        if (node.startsWith('id:') && !visited.has(node)) {
            const group: Donation[] = [];
            const stack = [node];
            visited.add(node);

            while (stack.length > 0) {
                const curr = stack.pop()!;

                // If it's an ID node, add the donation to the group
                if (curr.startsWith('id:')) {
                    const ds = donationMap.get(curr);
                    if (ds) group.push(...ds);
                }

                const neighbors = adj.get(curr);
                if (neighbors) {
                    for (const neighbor of neighbors) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            stack.push(neighbor);
                        }
                    }
                }
            }
            if (group.length > 0) {
                groups.push(group);
            }
        }
    }

    // Merge groups into MergedDonor objects
    return groups.map(group => {
        // Sort by date descending (newest first)
        group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const latest = group[0];
        const totalAmount = group.reduce((sum, d) => sum + Number(d.amount || 0), 0);

        // Find the most recent non-empty URL
        const validUrlDonor = group.find(d => d.user_url && d.user_url.trim() !== '');
        // Find the most recent non-empty Email
        const validEmailDonor = group.find(d => d.user_email && d.user_email.trim() !== '');

        return {
            id: `merged-${latest.id}`,
            user_name: latest.user_name, // Use the most recent name
            user_email: validEmailDonor?.user_email || undefined,
            user_url: validUrlDonor?.user_url || undefined,
            total_amount: totalAmount,
            donation_count: group.length,
            last_donation_at: new Date(latest.created_at).toISOString(),
            donations: group
        };
    });
}
