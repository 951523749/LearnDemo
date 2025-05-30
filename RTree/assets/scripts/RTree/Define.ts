
export type Rect = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

export type Item<T = any> = Rect & { data: T };
