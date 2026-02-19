import { JsonAnalysisAgent } from '../src/gigachat/json-agent.js';
import { REAL_USER_DATA } from '../tests/fixtures/real-data.js';
import * as dotenv from 'dotenv';
dotenv.config();
// Убираем шумные логи от SDK
const originalLog = console.log;
const originalWrite = process.stdout.write.bind(process.stdout);
console.log = (...args) => {
    const text = args.join(' ');
    if (text.includes('OAUTH UPDATE TOKEN')) {
        return;
    }
    originalLog(...args);
};
process.stdout.write = ((chunk, ...args) => {
    const text = chunk?.toString?.() || '';
    if (text.includes('OAUTH UPDATE TOKEN')) {
        return true;
    }
    return originalWrite(chunk, ...args);
});
async function main() {
    if (!process.env.GIGACHAT_API_KEY) {
        console.error('❌ GIGACHAT_API_KEY не найден');
        process.exit(1);
    }
    const agent = new JsonAnalysisAgent(process.env.GIGACHAT_API_KEY);
    console.log('Анализ биомеханики бега...\n');
    const result = await agent.analyzeAndGetJson(REAL_USER_DATA);
    console.log('\n' + JSON.stringify(result, null, 2));
}
main().catch(console.error);
//# sourceMappingURL=json-analysis.js.map