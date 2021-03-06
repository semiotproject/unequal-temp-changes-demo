import { EventEmitter } from 'events';
import ObservationStore from './observations-store';
import { INITIAL_TIME_BOUNDS, MODES, CITIES } from '../config';

const state = {
    currentTime: Date.now(),
    currentSnapshot: null,
    timeBounds: INITIAL_TIME_BOUNDS,
    showMapLabels: false,
    mode: MODES.diff,
    city: Object.keys(CITIES)[0],
    isPlaying: false
};

// every ten minutes
const PLAY_UPDATE_INTERVAL = 1000 * 60 * 20;

const PLAY_UPDATE_PERIOD = 1000;

let PLAY_TIMER = null;

class AppStateStore extends EventEmitter {
    constructor() {
        super();
        ObservationStore.on('newObservation', this.updateTimeBounds.bind(this));
    }

    get currentTime() {
        return state.currentTime;
    }
    set currentTime(timestamp) {
        state.currentTime = timestamp;
        if (this.isInBounds(timestamp)) {
            this.checkSnapshot(timestamp);
            this.emit('update');
        } else {
            console.warn(`new timestamp is out of bounds; stopping play`);
            this.isPlaying = false;
        }
    }

    get isPlaying() {
        return state.isPlaying;
    }
    set isPlaying(flag) {
        state.isPlaying = flag;
        if (flag) {
            this.startPlaying();
        } else {
            this.stopPlaying();
        }
        this.emit('update');
    }

    get currentSnapshot() {
        return state.currentSnapshot;
    }
    set currentSnapshot(timestamp) {
        state.currentSnapshot = timestamp;
        this.emit('update');
    }

    checkSnapshot(timestamp = state.currentTime) {
        state.currentSnapshot = ObservationStore.getSnapshotForTimestamp(timestamp);
    }

    startPlaying() {
        if (PLAY_TIMER) {
            this.stopPlaying();
        }
        PLAY_TIMER = setInterval(() => {
            this.currentTime += PLAY_UPDATE_INTERVAL;
        }, PLAY_UPDATE_PERIOD);
    }
    stopPlaying() {
        clearInterval(PLAY_TIMER);
        PLAY_TIMER = null;
    }

    get timeBounds() {
        return state.timeBounds;
    }
    updateTimeBounds() {
        state.timeBounds = [
            Date.now() - 12 * 3600 * 1000,
            Date.now() + 1000 * 10
        ];
        state.currentTime = Date.now();
        this.emit('update');
    }
    isInBounds(timestamp) {
        return state.timeBounds[0] < timestamp && state.timeBounds[1] > timestamp;
    }

    get showMapLabels() {
        return state.showMapLabels;
    }
    set showMapLabels(flag) {
        state.showMapLabels = flag;
        this.emit('update');
    }

    get mode() {
        return state.mode;
    }
    set mode(mode) {
        state.mode = mode;
        this.emit('update');
    }

    get city() {
        return state.city;
    }
    set city(city) {
        state.city = city;
        this.emit('update');
    }
}

export default new AppStateStore();
