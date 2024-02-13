// make a function that receives a start time and end time and returns an array of time blocks, each block is 30 minutes long
export function getTimeBlocks(start: Date, end: Date, intervalMinutes: number = 30) {
    const timeBlocks: Date[] = [];
    const current = new Date(start);
    while (current < end) {
        timeBlocks.push(new Date(current));
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    return timeBlocks.map((startAt) => ({
        startAt,
        endAt: new Date(startAt).setMinutes(startAt.getMinutes() + intervalMinutes)
    }))
}
    