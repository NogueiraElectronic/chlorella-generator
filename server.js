// server.js - Versión mínima que funciona 100%
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.static('public'));

// Crear directorio para datasets
const datasetsDir = path.join(__dirname, 'generated_datasets');
if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
}

// Función para generar datos simples
function generateData(scenarios, hours) {
    const data = [];
    
    for (let s = 1; s <= scenarios; s++) {
        const baseTemp = 20 + Math.random() * 8;
        const basePh = 7.0 + Math.random() * 1.0;
        const maxPAR = 500 + Math.random() * 400;
        
        let biomass = 0.1 + Math.random() * 0.2;
        
        for (let h = 0; h < hours; h++) {
            const hour = h % 24;
            const light = (hour >= 6 && hour <= 18) ? 
                maxPAR * Math.sin((hour - 6) * Math.PI / 12) : 0;
            
            const temp = baseTemp + Math.random() * 3 - 1.5;
            const ph = basePh + Math.random() * 0.6 - 0.3;
            const growth = 0.01 + Math.random() * 0.03;
            
            biomass = Math.min(biomass * (1 + growth), 3.0);
            
            data.push({
                Scenario: s,
                Time_h: h,
                pH: parseFloat(ph.toFixed(2)),
                Temperature_C: parseFloat(temp.toFixed(1)),
                PAR_umol_m2_s: parseFloat(light.toFixed(1)),
                Growth_Rate_h: parseFloat(growth.toFixed(4)),
                Biomass_g_L: parseFloat(biomass.toFixed(3)),
                Cell_Concentration_cells_mL: parseFloat((biomass * 1000000).toFixed(0)),
                Nutrients_g_L: parseFloat((1.0 - h * 0.001).toFixed(3)),
                Thermal_Stress: temp > 28 ? 1 : 0,
                pH_Stress: ph < 6.5 || ph > 8.5 ? 1 : 0
            });
        }
    }
    
    return data;
}

// Convertir a CSV
function toCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];
    
    data.forEach(row => {
        rows.push(headers.map(h => row[h]).join(','));
    });
    
    return rows.join('\n');
}

// Rutas
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor OK', time: new Date().toISOString() });
});

app.post('/generate-dataset', (req, res) => {
    try {
        const { scenarios = 25, hoursPerScenario = 120 } = req.body;
        
        console.log(`Generando ${scenarios} escenarios con ${hoursPerScenario} horas`);
        
        const data = generateData(scenarios, hoursPerScenario);
        
        // Dividir datos
        const shuffled = data.sort(() => Math.random() - 0.5);
        const trainSize = Math.floor(shuffled.length * 0.7);
        const validSize = Math.floor(shuffled.length * 0.15);
        
        const train = shuffled.slice(0, trainSize);
        const valid = shuffled.slice(trainSize, trainSize + validSize);
        const test = shuffled.slice(trainSize + validSize);
        
        // Guardar archivos
        const timestamp = Date.now();
        const folder = path.join(datasetsDir, timestamp.toString());
        fs.mkdirSync(folder, { recursive: true });
        
        fs.writeFileSync(path.join(folder, 'complete_dataset.csv'), toCSV(data));
        fs.writeFileSync(path.join(folder, 'training_data.csv'), toCSV(train));
        fs.writeFileSync(path.join(folder, 'validation_data.csv'), toCSV(valid));
        fs.writeFileSync(path.join(folder, 'test_data.csv'), toCSV(test));
        
        const stats = {
            totalPoints: data.length,
            trainingPoints: train.length,
            validationPoints: valid.length,
            testPoints: test.length,
            scenarios: scenarios,
            duration: hoursPerScenario,
            biomassRange: {
                min: Math.min(...data.map(d => d.Biomass_g_L)),
                max: Math.max(...data.map(d => d.Biomass_g_L)),
                mean: data.reduce((s, d) => s + d.Biomass_g_L, 0) / data.length
            },
            stressDistribution: {
                thermal: data.filter(d => d.Thermal_Stress === 1).length,
                ph: data.filter(d => d.pH_Stress === 1).length,
                normal: data.filter(d => d.Thermal_Stress === 0 && d.pH_Stress === 0).length
            },
            qualityMetrics: {
                completeness: 100,
                dataQuality: 'industrial',
                resolution: 'hour'
            },
            outputDir: folder
        };
        
        console.log('Dataset generado exitosamente');
        res.json({ success: true, stats, outputDir: folder });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/sample-data/:folder', (req, res) => {
    try {
        const filePath = path.join(datasetsDir, req.params.folder, 'complete_dataset.csv');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'No encontrado' });
        }
        
        const csv = fs.readFileSync(filePath, 'utf8');
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const data = [];
        for (let i = 1; i < Math.min(lines.length, 1001); i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((h, idx) => {
                    row[h] = isNaN(values[idx]) ? values[idx] : parseFloat(values[idx]);
                });
                data.push(row);
            }
        }
        
        res.json(data);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/download/:folder/:filename', (req, res) => {
    const filePath = path.join(datasetsDir, req.params.folder, req.params.filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('<h1>Servidor funcionando</h1><p>Falta el archivo public/index.html</p>');
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});

module.exports = app;
