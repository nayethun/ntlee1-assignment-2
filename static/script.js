let data = [];
let centroids = [];
let k = 3;
let clusters = []; // Store clusters
let isClustersInitialized = false; // Track if clusters have been initialized

function generateColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const color = `hsl(${(i * 360) / numColors}, 100%, 50%)`; // Generate distinct colors using hue
        colors.push(color);
    }
    return colors;
}

function generateData() {
    console.log("Generate Data button clicked");
    alert("Generating new dataset...");
    data = [];
    
    // Generate random points in the range [-10, 10]
    for (let i = 0; i < 100; i++) {
        const x = (Math.random() * 20) - 10;  // Random number between -10 and 10
        const y = (Math.random() * 20) - 10;  // Random number between -10 and 10
        data.push([x, y]);
    }

    isClustersInitialized = false; // Reset clustering status
    centroids = []; // Clear centroids
    clusters = []; // Clear clusters

    console.log("Generated data:", data); // Debugging message
    drawPlot();
}

function initializeCentroids() {
    console.log("Initialize Centroids button clicked");
    alert("Initializing centroids...");
    k = parseInt(document.getElementById('num-clusters').value);
    centroids = [];

    if (data.length === 0) {
        alert("Please generate data first!");
        return;
    }

    // Randomly pick centroids from the dataset
    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * data.length);
        centroids.push(data[randomIndex]);
    }

    clusters = Array(k).fill().map(() => []); // Initialize clusters array
    isClustersInitialized = true; // Mark clusters as initialized

    // Assign each point to the nearest centroid to initialize clusters
    assignPointsToClusters();
    
    console.log("Initialized centroids:", centroids); // Debugging message
    drawPlot();
}

function stepKMeans() {
    alert("Stepping through KMeans...");
    console.log("Step KMeans button clicked");

    if (centroids.length === 0) {
        alert("Please initialize centroids first.");
        return;
    }

    // Assign points to the nearest centroid
    assignPointsToClusters();

    // Update centroids to the mean of assigned points
    centroids = clusters.map(cluster => {
        if (cluster.length === 0) return [Math.random() * 20 - 10, Math.random() * 20 - 10];
        const x = cluster.reduce((sum, point) => sum + point[0], 0) / cluster.length;
        const y = cluster.reduce((sum, point) => sum + point[1], 0) / cluster.length;
        return [x, y];
    });

    drawPlot();
}

function runToConvergence() {
    alert("Running KMeans to Convergence...");
    console.log("Run to Convergence button clicked");

    let hasConverged = false;
    while (!hasConverged) {
        const previousCentroids = JSON.parse(JSON.stringify(centroids));
        stepKMeans();
        hasConverged = JSON.stringify(previousCentroids) === JSON.stringify(centroids);
    }

    console.log("Convergence reached.");
}

function reset() {
    console.log("Reset button clicked");
    alert("Resetting algorithm...");
    data = [];
    centroids = [];
    clusters = [];
    isClustersInitialized = false;
    drawPlot();
}

function assignPointsToClusters() {
    clusters = Array(k).fill().map(() => []);
    data.forEach(point => {
        let minDistance = Infinity;
        let clusterIndex = -1;
        centroids.forEach((centroid, index) => {
            const distance = Math.sqrt(Math.pow(point[0] - centroid[0], 2) + Math.pow(point[1] - centroid[1], 2));
            if (distance < minDistance) {
                minDistance = distance;
                clusterIndex = index;
            }
        });
        clusters[clusterIndex].push(point);
    });
}

function drawPlot() {
    console.log('Drawing plot'); // Debugging message

    const canvas = document.getElementById('plot');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Unable to get canvas context!');
        return;
    }

    // Set canvas dimensions and scale for -10 to 10 range
    const width = canvas.width;
    const height = canvas.height;
    const range = 20;  // From -10 to 10
    const halfRange = range / 2;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw faint grid lines
    ctx.strokeStyle = '#e0e0e0'; // Light grey color for grid lines
    ctx.lineWidth = 0.5;

    // Draw vertical grid lines
    for (let i = -halfRange; i <= halfRange; i++) {
        const x = ((i + halfRange) / range) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let i = -halfRange; i <= halfRange; i++) {
        const y = ((halfRange - i) / range) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw thicker and darker main axes (x = 0 and y = 0)
    ctx.strokeStyle = '#000000'; // Black color for main axes
    ctx.lineWidth = 2;

    // Y-axis (x = 0)
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // X-axis (y = 0)
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw axis labels (numbers)
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';

    // Draw y-axis labels
    for (let i = -halfRange; i <= halfRange; i++) {
        if (i !== 0) {
            const y = ((halfRange - i) / range) * height;
            ctx.fillText(i, width / 2 + 5, y - 2);
        }
    }

    // Draw x-axis labels
    for (let i = -halfRange; i <= halfRange; i++) {
        if (i !== 0) {
            const x = ((i + halfRange) / range) * width;
            ctx.fillText(i, x + 2, height / 2 - 5);
        }
    }

    // Draw graph title
    ctx.font = '16px Arial';
    ctx.fillText('KMeans Clustering Visualization', width / 2 - 100, 20);

    // Draw data points
    if (isClustersInitialized && clusters.length > 0) {
        // Draw points based on cluster assignment
        const colors = generateColors(k);
        clusters.forEach((cluster, index) => {
            cluster.forEach((point) => {
                const x = ((point[0] + 10) / range) * width;
                const y = ((10 - point[1]) / range) * height;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = colors[index];
                ctx.fill();
            });
        });
    } else {
        // Draw all points in blue before clustering
        data.forEach((point) => {
            const x = ((point[0] + 10) / range) * width;
            const y = ((10 - point[1]) / range) * height;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
        });
    }

    // Draw centroids as red X's
    centroids.forEach((centroid, index) => {
        const x = ((centroid[0] + 10) / range) * width;
        const y = ((10 - centroid[1]) / range) * height;

        // Debugging to ensure the centroid coordinates are correct
        console.log(`Centroid ${index}: (${centroid[0]}, ${centroid[1]}) -> Canvas: (${x}, ${y})`);

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 4;

            // Draw X shape for the centroid
            const size = 7;
            ctx.beginPath();
            ctx.moveTo(x - size, y - size);
            ctx.lineTo(x + size, y + size);
            ctx.moveTo(x - size, y + size);
            ctx.lineTo(x + size, y - size);
            ctx.stroke();
        } else {
            console.warn(`Centroid ${index} is out of canvas bounds: (${x}, ${y})`);
        }
    });
    console.log("Plot drawn with data points and centroids."); // Debugging message
}
drawPlot();
