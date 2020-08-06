#!/usr/bin/env node

import 'reflect-metadata';
import 'source-map-support/register';

import { config } from 'dotenv';

// Load environment variables from .env file
config();

import { run } from './lib/main';

// Run cli
run();
