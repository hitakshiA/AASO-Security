export interface Pattern {
    name: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    detect: (node: any) => boolean;
    message: string;
}