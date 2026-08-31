/**
 * Tracks whether a blocking modal is currently on screen.
 *
 * Lets a lower-priority prompt (the channel popup) hold back while a more
 * important one (the review prompt) is open, without either component
 * inspecting the other's markup.
 */
let openCount = 0;

export function markModalOpen() {
    openCount += 1;
}

export function markModalClosed() {
    openCount = Math.max(0, openCount - 1);
}

export function isAnyModalOpen() {
    return openCount > 0;
}
