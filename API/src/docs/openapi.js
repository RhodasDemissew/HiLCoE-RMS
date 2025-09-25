export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'HiLCoE RMS API',
    version: '0.1.0',
    description: 'API documentation for the HiLCoE RMS backend.'
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'P@ssw0rd' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string' }
            }
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name','email'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 80, example: 'Test User' },
          email: { type: 'string', format: 'email', example: 'test@hilcoe.local' },
          student_id: { type: 'string', maxLength: 40, example: 'STU-001', nullable: true }
        }
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['pending','active','inactive'] },
          activation_token: { type: 'string', nullable: true }
        }
      },
      ActivateRequest: {
        type: 'object',
        required: ['token','password'],
        properties: { token: { type: 'string' }, password: { type: 'string', minLength: 6 } }
      },
      ResetRequest: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } }
      },
      ResetConfirm: {
        type: 'object',
        required: ['token','password'],
        properties: { token: { type: 'string', minLength: 16 }, password: { type: 'string', minLength: 8 } }
      }
    }
  },
  tags: [
    { name: 'System', description: 'Service & health' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management (basic)' },
    { name: 'Projects', description: 'Create and manage projects' },
    { name: 'Milestones', description: 'Milestone lifecycle' },
    { name: 'Submissions', description: 'Upload and fetch submissions' },
    { name: 'Reviews', description: 'Milestone reviews' },
    { name: 'Extensions', description: 'Deadline extension workflow' },
    { name: 'Templates', description: 'Document templates' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'Reports', description: 'Aggregated reports' },
    { name: 'Verifications', description: 'Formatting and similarity checks' },
    { name: 'Defense', description: 'Examiner assignments, schedule, grades' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Service health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    service: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '401': { description: 'Invalid credentials' },
          '400': { description: 'Missing fields' }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Self-register (Researcher)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: {
          '201': { description: 'Registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } } },
          '400': { description: 'Validation error or duplicate email' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/auth/invite': {
      post: {
        tags: ['Auth'],
        summary: 'Invite a user (Admin only)',
        description: 'Creates or updates a user as inactive and returns an activation token.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'roleName'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  roleName: { type: 'string', enum: ['Admin','Coordinator','Advisor','Examiner','Researcher'] }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Invite created',
            content: { 'application/json': { schema: { type: 'object', properties: { activation_token: { type: 'string' } } } } }
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden (requires Admin)' }
        }
      }
    },
    '/auth/activate': {
      post: {
        tags: ['Auth'],
        summary: 'Activate invited user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ActivateRequest' } } }
        },
        responses: {
          '200': { description: 'Activated', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, current_stage: { type: 'string' } } } } } },
          '400': { description: 'Invalid token or missing fields' }
        }
      }
    },
    '/auth/reset/request': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset (always returns 200)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetRequest' } } } },
        responses: {
          '200': { description: 'Reset requested (token returned only in development)' },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/auth/reset/confirm': {
      post: {
        tags: ['Auth'],
        summary: 'Confirm password reset',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetConfirm' } } } },
        responses: {
          '200': { description: 'Password updated', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, current_stage: { type: 'string' } } } } } },
          '400': { description: 'Invalid or expired token' }
        }
      }
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Array of projects', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } } },
          '401': { description: 'Unauthorized' }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project (Researcher/Admin/Coordinator)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } } }
        },
        responses: {
          '201': { description: 'Project created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/projects/{id}/assign-advisor': {
      post: {
        tags: ['Projects'],
        summary: 'Assign advisor (Coordinator/Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignAdvisorRequest' } } } },
        responses: {
          '200': { description: 'Assigned', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, current_stage: { type: 'string' } } } } } },
          '400': { description: 'Invalid ids or constraints' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Project not found' }
        }
      }
    },
    '/projects/{id}/milestones': {
      get: {
        tags: ['Projects'],
        summary: 'List milestones for a project',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: {
          '200': { description: 'Project milestones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Milestone' } } } } },
          '400': { description: 'Invalid project id' }
        }
      }
    },
    '/projects/{id}/milestones/{type}/schedule': {
      put: {
        tags: ['Projects'],
        summary: 'Update milestone schedule',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['registration','synopsis','proposal','progress1','progress2','thesis_precheck','defense','thesis_postdefense','journal'] } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              window_start: { oneOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
              window_end: { oneOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
              due_at: { oneOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
              notes: { type: 'string' }
            }
          } } }
        },
        responses: {
          '200': { description: 'Updated milestone', content: { 'application/json': { schema: { $ref: '#/components/schemas/Milestone' } } } },
          '400': { description: 'Validation error' },
          '403': { description: 'Requires Coordinator or Admin role' }
        }
      }
    },

    '/milestones': {
      get: {
        tags: ['Milestones'],
        summary: 'List milestones',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of milestones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Milestone' } } } } } }
      },
      post: {
        tags: ['Milestones'],
        summary: 'Create milestone',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMilestoneRequest' } } } },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Milestone' } } } },
          '400': { description: 'Validation error' },
          '404': { description: 'Project not found' }
        }
      }
    },
    '/milestones/{id}/transition': {
      post: {
        tags: ['Milestones'],
        summary: 'Transition milestone status',
        description: 'Allowed values depend on role and current status.',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MilestoneTransitionRequest' } } } },
        responses: {
          '200': { description: 'Updated milestone', content: { 'application/json': { schema: { $ref: '#/components/schemas/Milestone' } } } },
          '400': { description: 'Transition not allowed/invalid' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' }
        }
      }
    },
    '/submissions': {
      post: {
        tags: ['Submissions'],
        summary: 'Upload a submission (base64 files)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmissionCreateRequest' } } } },
        responses: {
          '201': { description: 'Created submission', content: { 'application/json': { schema: { $ref: '#/components/schemas/Submission' } } } },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Milestone not found' }
        }
      }
    },
    '/submissions/{id}/files/{index}': {
      get: {
        tags: ['Submissions'],
        summary: 'Download a submission file',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'index', in: 'path', required: true, schema: { type: 'integer', minimum: 0 } }
        ],
        responses: {
          '200': { description: 'Binary file stream', content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Submission/file not found' }
        }
      }
    },
    '/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List reviews',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of reviews' } }
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create a review',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewCreateRequest' } } } },
        responses: { '201': { description: 'Created review' }, '400': { description: 'Validation error' } }
      }
    },
    '/extensions': {
      post: {
        tags: ['Extensions'],
        summary: 'Request deadline extension',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExtensionRequestCreate' } } } },
        responses: { '201': { description: 'Created extension request' }, '400': { description: 'Validation error' } }
      }
    },
    '/extensions/{id}/decision': {
      patch: {
        tags: ['Extensions'],
        summary: 'Approve or reject extension',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExtensionDecision' } } } },
        responses: { '200': { description: 'Updated' }, '400': { description: 'Invalid decision/id' } }
      }
    },
    '/templates': {
      get: {
        tags: ['Templates'],
        summary: 'List document templates',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of templates' } }
      },
      post: {
        tags: ['Templates'],
        summary: 'Create a document template',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TemplateCreate' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } }
      }
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List my notifications',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of notifications' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not found' } }
      }
    },
    '/reports/milestones': {
      get: {
        tags: ['Reports'],
        summary: 'Milestones report',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Counts by status' } }
      }
    },
    '/reports/plagiarism': {
      get: {
        tags: ['Reports'],
        summary: 'Plagiarism summary',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Average/max similarity' } }
      }
    },
    '/verifications/{submissionId}': {
      get: {
        tags: ['Verifications'],
        summary: 'List verification jobs for a submission',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { '200': { description: 'Array of verification jobs' }, '400': { description: 'Invalid id' } }
      }
    },
    '/verifications/{submissionId}/queue': {
      post: {
        tags: ['Verifications'],
        summary: 'Queue format and similarity checks',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { '201': { description: 'Jobs queued' }, '400': { description: 'Invalid id' } }
      }
    },
    '/defense/{projectId}/assign-examiner': {
      post: {
        tags: ['Defense'],
        summary: 'Assign an examiner',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['examinerId'], properties: { examinerId: { type: 'string' }, due_at: { type: 'string', format: 'date-time' } } } } } },
        responses: { '201': { description: 'Assignment created' }, '400': { description: 'Invalid ids' } }
      }
    },
    '/defense/{projectId}/schedule-defense': {
      post: {
        tags: ['Defense'],
        summary: 'Schedule a defense',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['start_at'], properties: { start_at: { type: 'string', format: 'date-time' }, end_at: { type: 'string', format: 'date-time' }, location: { type: 'string' }, virtual_link: { type: 'string' } } } } } },
        responses: { '201': { description: 'Scheduled' }, '400': { description: 'Invalid' } }
      }
    },
    '/defense/{projectId}/grades': {
      post: {
        tags: ['Defense'],
        summary: 'Upsert grades',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { components: { type: 'object', additionalProperties: { type: 'number' } }, total: { type: 'number' }, finalized: { type: 'boolean' } } } } } },
        responses: { '200': { description: 'Grade saved' }, '400': { description: 'Invalid' } }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (Admin/Coordinator)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Array of users' },
          '403': { description: 'Requires Admin or Coordinator role' }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create user (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name','email','roleName'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, roleName: { type: 'string', enum: ['Admin','Coordinator','Advisor','Examiner','Researcher'] } } } } } },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Validation error' },
          '403': { description: 'Requires Admin role' }
        }
      }
    }
  }
};

// Extend components with domain schemas
openapi.components.schemas.Project = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    area: { type: 'string' },
    semester: { type: 'string' },
    researcher: { type: 'string' },
    advisor: { type: 'string', nullable: true },
    status: { type: 'string', enum: ['active','archived'] },
    current_stage: { type: 'string' },
    advisor_assigned_at: { type: 'string', format: 'date-time', nullable: true },
    coordinator_notes: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
};

openapi.components.schemas.Milestone = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    project: { type: 'string' },
    type: { type: 'string', enum: ['registration','synopsis','proposal','progress1','progress2','thesis_precheck','thesis_postdefense','defense','journal'] },
    status: { type: 'string', enum: ['draft','submitted','under_review','changes_requested','approved','scheduled','graded','archived'] },
    sequence: { type: 'integer' },
    window_start: { type: 'string', format: 'date-time', nullable: true, example: null },
    window_end: { type: 'string', format: 'date-time', nullable: true, example: null },
    due_at: { type: 'string', format: 'date-time', nullable: true, example: null },
    submitted_at: { type: 'string', format: 'date-time', nullable: true, example: null },
    approved_by: { type: 'string', nullable: true, example: null },
    assignment_required: { type: 'boolean' },
    reviewer_roles: { type: 'array', items: { type: 'string' } },
    coordinator_notes: { type: 'string' }
  }
};

openapi.components.schemas.Submission = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    milestone: { type: 'string' },
    version: { type: 'integer' },
    notes: { type: 'string', nullable: true },
    files: {
      type: 'array', items: {
        type: 'object', properties: {
          filename: { type: 'string' },
          path: { type: 'string' },
          mimetype: { type: 'string' },
          size: { type: 'integer' }
        }
      }
    }
  }
};

openapi.components.schemas.CreateProjectRequest = {
  type: 'object', required: ['title'], properties: {
    title: { type: 'string', example: 'AI Thesis' },
    area: { type: 'string', example: 'AI' },
    semester: { type: 'string', example: '2025-1' }
  }
};

openapi.components.schemas.AssignAdvisorRequest = {
  type: 'object', required: ['advisorId'], properties: { advisorId: { type: 'string' } }
};

openapi.components.schemas.CreateMilestoneRequest = {
  type: 'object', required: ['projectId','type'], properties: {
    projectId: { type: 'string' },
    type: { type: 'string', enum: ['registration','synopsis','proposal','progress1','progress2','thesis_precheck','thesis_postdefense','defense','journal'] },
    due_at: { type: 'string', format: 'date-time' }
  }
};

openapi.components.schemas.MilestoneTransitionRequest = {
  type: 'object', required: ['to'], properties: { to: { type: 'string', enum: ['draft','submitted','under_review','changes_requested','approved','scheduled','graded','archived'] } }
};

openapi.components.schemas.SubmissionCreateRequest = {
  type: 'object', required: ['milestoneId'], properties: {
    milestoneId: { type: 'string' },
    notes: { type: 'string' },
    files: { type: 'array', items: { $ref: '#/components/schemas/FileUpload' } }
  }
};

openapi.components.schemas.FileUpload = {
  type: 'object', required: ['filename','content'], properties: {
    filename: { type: 'string', example: 'hello.txt' },
    mimetype: { type: 'string', example: 'text/plain' },
    content: { type: 'string', description: 'Base64-encoded file content', example: 'SGVsbG8gd29ybGQ=' }
  }
};

openapi.components.schemas.ReviewCreateRequest = {
  type: 'object', required: ['milestoneId','decision'], properties: {
    milestoneId: { type: 'string' },
    decision: { type: 'string', enum: ['approved','changes_requested','under_review'] },
    comments: { type: 'string' }
  }
};

openapi.components.schemas.ExtensionRequestCreate = {
  type: 'object', required: ['milestoneId','reason'], properties: {
    milestoneId: { type: 'string' },
    reason: { type: 'string' },
    new_due_at: { type: 'string', format: 'date-time' }
  }
};

openapi.components.schemas.ExtensionDecision = {
  type: 'object', required: ['decision'], properties: { decision: { type: 'string', enum: ['approved','rejected'] } }
};

openapi.components.schemas.TemplateCreate = {
  type: 'object', required: ['type','url'], properties: {
    type: { type: 'string', example: 'proposal' },
    version: { type: 'string', example: '1.0' },
    url: { type: 'string', example: 'https://example.com/template.docx' }
  }
};












