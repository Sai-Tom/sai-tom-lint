import { RuleTester } from 'eslint';
import rule from '../../../src/rules/align-object-properties';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: require('@typescript-eslint/parser'),
  },
});

ruleTester.run('align-object-properties', rule, {
  valid: [
    // Already aligned object
    {
      code: `
const obj = {
  a   : 1,
  bb  : 2,
  ccc : 3
};
      `,
    },
    // Single property
    {
      code: `
const obj = {
  a: 1
};
      `,
    },
    // Already aligned interface
    {
      code: `
interface User {
  id    : number;
  name  : string;
  email : string;
}
      `,
    },
    // Groups separated by blank lines
    {
      code: `
const obj = {
  a  : 1,
  bb : 2,

  ccc  : 3,
  dddd : 4
};
      `,
    },
  ],

  invalid: [
    // Unaligned object properties
    {
      code: `
export const ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  comments: '/comments',
  notifications: '/notifications'
};
      `,
      output: `
export const ENDPOINTS = {
  users         : '/users',
  posts         : '/posts',
  comments      : '/comments',
  notifications : '/notifications'
};
      `,
      errors: [
        {
          message: 'Object properties are not aligned',
        },
      ],
    },
    // Unaligned interface
    {
      code: `
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}
      `,
      output: `
interface User {
  id    : number;
  name  : string;
  email : string;
  role  : string;
}
      `,
      errors: [
        {
          message: 'Object properties are not aligned',
        },
      ],
    },
    // Mixed property types
    {
      code: `
const config = {
  host: 'localhost',
  port: 3000,
  database: 'mydb',
  ssl: true
};
      `,
      output: `
const config = {
  host     : 'localhost',
  port     : 3000,
  database : 'mydb',
  ssl      : true
};
      `,
      errors: [
        {
          message: 'Object properties are not aligned',
        },
      ],
    },
  ],
}); 