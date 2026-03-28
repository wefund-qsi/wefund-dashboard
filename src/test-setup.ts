// Mock HTMLCanvasElement.getContext pour jsdom (Chart.js)
HTMLCanvasElement.prototype.getContext = () => null;
