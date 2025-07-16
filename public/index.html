// server.js - Servidor Node.js para generar dataset de Chlorella
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Configuración para generación de datos
const dataConfig = {
  scenarios: 50,
  hoursPerScenario: 240,
  totalDataPoints: 12000,
  trainRatio: 0.7,
  validRatio: 0.15,
  testRatio: 0.15
};

// Función para generar datos de un escenario
function generateScenarioData(scenarioId, params) {
  const data = [];
  let currentBiomass = params.initialBiomass;
  let currentCellConc = currentBiomass * 2e6;
  let currentpH = params.basePH;
  let currentTemp = params.baseTemp;
  let nutrients = params.nutrientLevel;
  
  for (let hour = 0; hour < dataConfig.hoursPerScenario; hour++) {
    // Ciclo de luz
    let lightIntensity;
    if (params.lightRegime === 'continuous') {
      lightIntensity = params.maxPAR * (0.8 + 0.2 * Math.random());
    } else {
      const hourOfDay = hour % 24;
      lightIntensity = hourOfDay >= 6 && hourOfDay <= 18 ? 
        params.maxPAR * Math.sin((hourOfDay - 6) * Math.PI / 12) : 0;
    }
    
    // Variaciones de temperatura
    const tempVariation = params.stressCondition === 'high_temp' ? 
      5 + Math.random() * 3 : Math.random() * 2 - 1;
    currentTemp = Math.max(15, Math.min(40, 
      params.baseTemp + tempVariation + 2 * Math.sin(hour * Math.PI / 12)));
    
    // Variaciones de pH
    const pHDrift = params.stressCondition === 'low_pH' ? 
      -0.5 + Math.random() * 0.2 : (Math.random() - 0.5) * 0.1;
    currentpH = Math.max(6.0, Math.min(9.0, 
      params.basePH + pHDrift + 0.3 * Math.sin(hour * 0.05)));
    
    // Depleción de nutrientes
    nutrients = Math.max(0.1, nutrients - 0.001 * currentBiomass);
    
    // Cálculo de μ (tasa de crecimiento específica)
    const lightEffect = Math.min(1, lightIntensity / 300);
    const tempEffect = currentTemp >= 15 && currentTemp <= 35 ? 
      Math.exp(-Math.pow((currentTemp - 25) / 10, 2)) : 0.1;
    const pHEffect = currentpH >= 6.5 && currentpH <= 8.5 ? 
      Math.exp(-Math.pow((currentpH - 7.2) / 1.5, 2)) : 0.1;
    const nutrientEffect = nutrients / (nutrients + 0.1);
    const densityEffect = Math.max(0.1, 1 - currentBiomass / 4);
    
    const mu = 0.08 * lightEffect * tempEffect * pHEffect * nutrientEffect * densityEffect;
    
    // Actualizar biomasa y concentración celular
    const growthRate = Math.max(0, mu + (Math.random() - 0.5) * 0.005);
    currentBiomass = currentBiomass * (1 + growthRate);
    currentCellConc = currentCellConc * (1 + growthRate);
    
    // Limitar valores máximos
    currentBiomass = Math.min(currentBiomass, 5.0);
    currentCellConc = Math.min(currentCellConc, 2e7);
    
    // Agregar ruido realista
    const biomassNoise = currentBiomass * (1 + (Math.random() - 0.5) * 0.02);
    const cellConcNoise = currentCellConc * (1 + (Math.random() - 0.5) * 0.03);
    
    data.push({
      Scenario: scenarioId,
      Hora: hour,
      pH: parseFloat(currentpH.toFixed(2)),
      Temperatura: parseFloat(currentTemp.toFixed(1)),
      PAR: parseFloat(lightIntensity.toFixed(1)),
      mu: parseFloat(growthRate.toFixed(4)),
      Biomasa: parseFloat(biomassNoise.toFixed(3)),
      Concentracion_Celular: parseFloat(cellConcNoise.toFixed(0)),
      Nutrientes: parseFloat(nutrients.toFixed(3)),
      Densidad_Optica: parseFloat((currentBiomass * 2.5).toFixed(3)),
      Productividad: parseFloat((currentBiomass * growthRate * 24).toFixed(3)),
      Eficiencia_Luz: parseFloat((mu / Math.max(0.001, lightIntensity / 1000)).toFixed(4)),
      Estres_Termico: currentTemp > 32 || currentTemp < 18 ? 1 : 0,
      Estres_pH: currentpH < 6.5 || currentpH > 8.5 ? 1 : 0
    });
  }
  
  return data;
}

// Función para mezclar array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Función para convertir a CSV
function arrayToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  return csvContent;
}

// Endpoint para generar dataset
app.post('/generate-dataset', (req, res) => {
  const { scenarios = 50, hoursPerScenario = 240 } = req.body;
  
  try {
    console.log('Iniciando generación de dataset...');
    const allData = [];
    
    // Generar múltiples escenarios
    for (let scenario = 0; scenario < scenarios; scenario++) {
      const scenarioParams = {
        baseTemp: 20 + Math.random() * 10,
        basePH: 6.8 + Math.random() * 1.2,
        maxPAR: 400 + Math.random() * 600,
        initialBiomass: 0.05 + Math.random() * 0.3,
        nutrientLevel: 0.5 + Math.random() * 0.5,
        lightRegime: Math.random() > 0.5 ? 'continuous' : 'cyclic',
        stressCondition: Math.random() > 0.8 ? 'high_temp' : 
                        Math.random() > 0.6 ? 'low_pH' : 'normal'
      };
      
      const scenarioData = generateScenarioData(scenario, scenarioParams);
      allData.push(...scenarioData);
      
      // Progreso cada 10 escenarios
      if (scenario % 10 === 0) {
        console.log(`Progreso: ${scenario}/${scenarios} escenarios completados`);
      }
    }
    
    // Dividir datos
    const shuffledData = shuffleArray(allData);
    const trainSize = Math.floor(shuffledData.length * dataConfig.trainRatio);
    const validSize = Math.floor(shuffledData.length * dataConfig.validRatio);
    
    const trainingData = shuffledData.slice(0, trainSize);
    const validationData = shuffledData.slice(trainSize, trainSize + validSize);
    const testData = shuffledData.slice(trainSize + validSize);
    
    // Guardar archivos CSV
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, 'generated_datasets', timestamp);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outputDir, 'training_data.csv'), arrayToCSV(trainingData));
    fs.writeFileSync(path.join(outputDir, 'validation_data.csv'), arrayToCSV(validationData));
    fs.writeFileSync(path.join(outputDir, 'test_data.csv'), arrayToCSV(testData));
    fs.writeFileSync(path.join(outputDir, 'complete_dataset.csv'), arrayToCSV(allData));
    
    // Estadísticas
    const stats = {
      totalPoints: allData.length,
      trainingPoints: trainingData.length,
      validationPoints: validationData.length,
      testPoints: testData.length,
      scenarios: scenarios,
      biomassRange: {
        min: Math.min(...allData.map(d => d.Biomasa)),
        max: Math.max(...allData.map(d => d.Biomasa)),
        mean: allData.reduce((sum, d) => sum + d.Biomasa, 0) / allData.length
      },
      outputDir: outputDir
    };
    
    console.log('Dataset generado exitosamente!');
    res.json({ success: true, stats, outputDir });
    
  } catch (error) {
    console.error('Error generando dataset:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para descargar archivos
app.get('/download/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, 'generated_datasets', folder, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Archivo no encontrado');
  }
});

// Endpoint para listar datasets generados
app.get('/datasets', (req, res) => {
  const datasetsDir = path.join(__dirname, 'generated_datasets');
  
  if (!fs.existsSync(datasetsDir)) {
    return res.json([]);
  }
  
  const folders = fs.readdirSync(datasetsDir).filter(item => {
    return fs.statSync(path.join(datasetsDir, item)).isDirectory();
  });
  
  const datasets = folders.map(folder => {
    const folderPath = path.join(datasetsDir, folder);
    const files = fs.readdirSync(folderPath);
    const stats = fs.statSync(folderPath);
    
    return {
      id: folder,
      created: stats.birthtime,
      files: files.map(file => ({
        name: file,
        size: fs.statSync(path.join(folderPath, file)).size
      }))
    };
  });
  
  res.json(datasets);
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Accede a http://localhost:${PORT} para usar el generador`);
});
