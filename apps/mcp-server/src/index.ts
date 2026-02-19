#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Import tools
import { analyzeRunTool } from './tools/analyze-run';
import { analyzeSimpleTool } from './tools/analyze-simple';
import { detectErrorsTool } from './tools/detect-errors';
import { getFocusTool } from './tools/get-focus';
import { getRecommendationsTool } from './tools/get-recommendations';

// Import JsonAnalysisAgent
import { JsonAnalysisAgent } from './gigachat/json-agent';

dotenv.config();

const server = new Server(
  {
    name: 'running-biomechanics-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    analyzeRunTool.definition,
    analyzeSimpleTool.definition,
    detectErrorsTool.definition,
    getFocusTool.definition,
    getRecommendationsTool.definition,
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'analyze_run':
      return analyzeRunTool.handler(args as any);
    case 'analyze_simple':
      return analyzeSimpleTool.handler(args as any);
    case 'detect_errors':
      return detectErrorsTool.handler(args as any);
    case 'get_focus':
      return getFocusTool.handler(args as any);
    case 'get_recommendations':
      return getRecommendationsTool.handler(args as any);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// HTTP Server setup
const app = express();
app.use(cors());
app.use(express.json());

// POST /analyze endpoint
app.post('/analyze', async (req, res) => {
  try {
    const input = req.body;
    
    if (!process.env.GIGACHAT_API_KEY) {
      return res.status(500).json({ error: 'GIGACHAT_API_KEY not configured' });
    }
    
    const agent = new JsonAnalysisAgent(
      process.env.GIGACHAT_API_KEY,
      process.env.GIGACHAT_MODEL || 'GigaChat'
    );
    
    const result = await agent.analyzeAndGetJson(input);
    res.json(result);
  } catch (error) {
    console.error('Error in /analyze:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'running-biomechanics-mcp' });
});

async function main() {
  const port = process.env.PORT || 3000;
  
  // Start HTTP server
  app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
    console.log(`POST /analyze endpoint ready`);
    console.log(`GET /health endpoint ready`);
  });
  
  // Optionally start MCP stdio server (if needed for MCP clients)
  // const transport = new StdioServerTransport();
  // await server.connect(transport);
  // console.error('Running Biomechanics MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
