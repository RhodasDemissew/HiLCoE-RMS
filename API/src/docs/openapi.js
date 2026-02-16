// Dynamically determine server URL
function getServerUrl() {
  // In production (Render), use APP_BASE_URL or detect from environment
  if (process.env.NODE_ENV === 'production') {
    // Use APP_BASE_URL if set, otherwise construct from request
    const baseUrl = process.env.APP_BASE_URL;
    if (baseUrl && baseUrl.startsWith('http')) {
      return baseUrl;
    }
    // Fallback: Render provides RENDER_EXTERNAL_URL
    if (process.env.RENDER_EXTERNAL_URL) {
      return process.env.RENDER_EXTERNAL_URL;
    }
  }
  // Default to localhost for development
  return 'http://localhost:4000';
}

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'HiLCoE RMS API',
    version: '0.1.0',
    description: 'API documentation for the HiLCoE RMS backend.'
  },
  servers: [
    { url: getServerUrl(), description: process.env.NODE_ENV === 'production' ? 'Production' : 'Local' },
    { url: 'http://localhost:4000', description: 'Local (Development)' }
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
      VerifyStudentRequest: {
        type: 'object',
        required: ['first_name','last_name','student_id'],
        properties: {
          first_name: { type: 'string', example: 'Rhea' },
          middle_name: { type: 'string', example: 'M.' },
          last_name: { type: 'string', example: 'Researcher' },
          student_id: { type: 'string', example: 'RMS2025-001' }
        }
      },
      VerifyStudentResponse: {
        type: 'object',
        properties: {
          verification_token: { type: 'string', nullable: true },
          expires_at: { type: 'string', format: 'date-time', nullable: true },
          login_hint: { type: 'string', format: 'email', nullable: true },
          already_registered: { type: 'boolean' },
          student: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              middle_name: { type: 'string' },
              last_name: { type: 'string' },
              student_id: { type: 'string' },
              program: { type: 'string' },
              already_registered: { type: 'boolean' },
              verified_email: { type: 'string', format: 'email', nullable: true }
            }
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['verification_token','email','password'],
        properties: {
          verification_token: { type: 'string', example: 'f5f6b4...' },
          email: { type: 'string', format: 'email', example: 'student@example.com' },
          phone: { type: 'string', example: '+251-900000000' },
          password: { type: 'string', minLength: 8, example: 'SecurePass123' }
        }
      },
      RegisterResponse: {
        $ref: '#/components/schemas/LoginResponse'
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
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          department: { type: 'string' },
          bio: { type: 'string' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 }
        }
      },
      UpdatePreferencesRequest: {
        type: 'object',
        properties: {
          notifications: { type: 'object' },
          theme: { type: 'string' }
        }
      },
      LoginRequestWithRemember: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          rememberMe: { type: 'boolean', default: false }
        }
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
    { name: 'Conversations', description: 'Messaging and conversations' },
    { name: 'Dashboard', description: 'Dashboard statistics and data' },
    { name: 'Calendar', description: 'Calendar events' },
    { name: 'Availability', description: 'Defense availability checking' },
    { name: 'Activity Log', description: 'System activity logging' },
    { name: 'Supervisors', description: 'Supervisor management' },
    { name: 'Stage Submissions', description: 'Stage-gated submissions' },
    { name: 'Student Verifications', description: 'Student verification records' },
    { name: 'Students', description: 'Student management' },
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
              schema: { $ref: '#/components/schemas/LoginRequestWithRemember' }
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
    '/auth/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify student eligibility',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyStudentRequest' } } }
        },
        responses: {
          '200': {
            description: 'Student verified',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyStudentResponse' } } }
          },
          '400': { description: 'Not found or mismatch' }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Complete account signup',
        description: 'Exchanges a verification token for an active user account.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: {
          '201': {
            description: 'Account created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } }
          },
          '400': { description: 'Validation error or token issue' }
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
      },
      delete: {
        tags: ['Notifications'],
        summary: 'Clear all notifications',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'All notifications cleared' }, '401': { description: 'Unauthorized' } }
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
    },
    '/users/profile': {
      patch: {
        tags: ['Users'],
        summary: 'Update user profile',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } } },
        responses: { '200': { description: 'Profile updated' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/users/preferences': {
      get: {
        tags: ['Users'],
        summary: 'Get user preferences',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'User preferences' }, '401': { description: 'Unauthorized' } }
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user preferences',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePreferencesRequest' } } } },
        responses: { '200': { description: 'Preferences updated' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/users/change-password': {
      patch: {
        tags: ['Users'],
        summary: 'Change user password',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } } },
        responses: { '200': { description: 'Password changed' }, '400': { description: 'Invalid current password' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'List conversations',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of conversations' }, '401': { description: 'Unauthorized' } }
      },
      post: {
        tags: ['Conversations'],
        summary: 'Create a conversation',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Conversation created' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations/all': {
      delete: {
        tags: ['Conversations'],
        summary: 'Delete all conversations',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'All conversations deleted' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations/researchers': {
      get: {
        tags: ['Conversations'],
        summary: 'List researchers for conversation',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of researchers' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations/users/{userId}/ensure': {
      post: {
        tags: ['Conversations'],
        summary: 'Ensure direct conversation with user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Conversation ensured' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations/projects/{projectId}/ensure': {
      post: {
        tags: ['Conversations'],
        summary: 'Ensure project conversation',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Conversation ensured' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations/cleanup': {
      post: {
        tags: ['Conversations'],
        summary: 'Cleanup conversations',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Cleanup completed' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations/{id}': {
      get: {
        tags: ['Conversations'],
        summary: 'Get conversation by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Conversation details' }, '401': { description: 'Unauthorized' }, '404': { description: 'Not found' } }
      }
    },
    '/conversations/{id}/messages': {
      get: {
        tags: ['Conversations'],
        summary: 'Get messages in conversation',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Array of messages' }, '401': { description: 'Unauthorized' } }
      },
      post: {
        tags: ['Conversations'],
        summary: 'Send message in conversation',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } } } } },
        responses: { '201': { description: 'Message sent' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/conversations/{id}/read': {
      post: {
        tags: ['Conversations'],
        summary: 'Mark conversation as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Marked as read' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/dashboard/statistics': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard statistics (Coordinator/Admin only)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Dashboard statistics' }, '403': { description: 'Requires Coordinator or Admin role' } }
      }
    },
    '/dashboard/submissions-by-stage': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get submissions by stage (Coordinator/Admin only)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Submissions by stage' }, '403': { description: 'Requires Coordinator or Admin role' } }
      }
    },
    '/dashboard/recent-messages': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get recent messages for dashboard',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Recent messages' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/dashboard/upcoming-events': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get upcoming events (Coordinator/Admin only)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Upcoming events' }, '403': { description: 'Requires Coordinator or Admin role' } }
      }
    },
    '/calendar': {
      get: {
        tags: ['Calendar'],
        summary: 'List calendar events',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of calendar events' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/availability': {
      get: {
        tags: ['Availability'],
        summary: 'Check defense availability',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'start_at', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'end_at', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'examinerId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Availability status' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/activity-log': {
      get: {
        tags: ['Activity Log'],
        summary: 'Get activity log (Coordinator/Admin/Supervisor)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Activity log entries' }, '403': { description: 'Requires appropriate role' } }
      }
    },
    '/activity-log/recent': {
      get: {
        tags: ['Activity Log'],
        summary: 'Get recent activity (Coordinator/Admin/Supervisor)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Recent activity' }, '403': { description: 'Requires appropriate role' } }
      }
    },
    '/supervisors': {
      get: {
        tags: ['Supervisors'],
        summary: 'List supervisors',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 25 } }
        ],
        responses: { '200': { description: 'List of supervisors' }, '401': { description: 'Unauthorized' } }
      },
      post: {
        tags: ['Supervisors'],
        summary: 'Add supervisor',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Supervisor added' }, '400': { description: 'Validation error' } }
      }
    },
    '/supervisors/{id}': {
      patch: {
        tags: ['Supervisors'],
        summary: 'Update supervisor',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Supervisor updated' }, '400': { description: 'Validation error' } }
      },
      delete: {
        tags: ['Supervisors'],
        summary: 'Delete supervisor',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Supervisor deleted' }, '400': { description: 'Error' } }
      }
    },
    '/supervisors/available': {
      get: {
        tags: ['Supervisors'],
        summary: 'List available supervisors for assignment',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Available supervisors' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/supervisors/specializations': {
      get: {
        tags: ['Supervisors'],
        summary: 'List supervisor specializations',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Specializations list' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/supervisors/dashboard/overview': {
      get: {
        tags: ['Supervisors'],
        summary: 'Get supervisor dashboard overview',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Dashboard overview' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/supervisors/add': {
      post: {
        tags: ['Supervisors'],
        summary: 'Add supervisor (alternative endpoint)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Supervisor added' }, '400': { description: 'Validation error' } }
      }
    },
    '/supervisors/import': {
      post: {
        tags: ['Supervisors'],
        summary: 'Import supervisors',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'mode', in: 'query', schema: { type: 'string', default: 'strict' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { entries: { type: 'array', items: { type: 'object' } } } } } } },
        responses: { '201': { description: 'Import summary' }, '400': { description: 'Validation error' } }
      }
    },
    '/supervisors/assign': {
      post: {
        tags: ['Supervisors'],
        summary: 'Assign supervisor to student',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Supervisor assigned' }, '400': { description: 'Validation error' } }
      }
    },
    '/supervisors/unassign': {
      post: {
        tags: ['Supervisors'],
        summary: 'Unassign supervisor from student',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Supervisor unassigned' }, '400': { description: 'Validation error' } }
      }
    },
    '/stages/researchers/dashboard': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'Get researcher dashboard overview',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Dashboard overview' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/stages/researchers/progress': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'Get researcher progress',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Progress data' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/stages/templates/proposal': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'Get proposal template',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Template data' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/stages/submissions': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'List stage submissions',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of submissions' }, '401': { description: 'Unauthorized' } }
      },
      post: {
        tags: ['Stage Submissions'],
        summary: 'Create stage submission',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Submission created' }, '400': { description: 'Validation error' } }
      }
    },
    '/stages/submissions/{id}/file': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'Download submission file',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'File stream' }, '401': { description: 'Unauthorized' }, '404': { description: 'Not found' } }
      }
    },
    '/stages/submissions/{id}/review': {
      post: {
        tags: ['Stage Submissions'],
        summary: 'Review submission',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Review completed' }, '400': { description: 'Validation error' } }
      }
    },
    '/stages/coordinator/submissions': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'List submissions (Coordinator view)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of submissions' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/stages/submissions/{id}/analyze': {
      post: {
        tags: ['Stage Submissions'],
        summary: 'Analyze submission',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Analysis started' }, '400': { description: 'Validation error' } }
      }
    },
    '/stages/submissions/{id}/analysis': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'Get submission analysis',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Analysis results' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/stages/submissions/{id}/format-check': {
      post: {
        tags: ['Stage Submissions'],
        summary: 'Check submission formatting',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Format check completed' }, '400': { description: 'Validation error' } }
      }
    },
    '/stages/submissions/{id}/format-report': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'Get format report',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Format report' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/stages/submissions/{id}/format-report.json': {
      get: {
        tags: ['Stage Submissions'],
        summary: 'Download format report as JSON',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'JSON format report' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/student-verifications': {
      get: {
        tags: ['Student Verifications'],
        summary: 'List student verifications',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Paged student verifications' }, '401': { description: 'Unauthorized' } }
      },
      post: {
        tags: ['Student Verifications'],
        summary: 'Create student verification',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Verification created' }, '400': { description: 'Validation error' } }
      }
    },
    '/student-verifications/{id}': {
      patch: {
        tags: ['Student Verifications'],
        summary: 'Update student verification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Verification updated' }, '400': { description: 'Validation error' } }
      },
      delete: {
        tags: ['Student Verifications'],
        summary: 'Delete student verification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Verification deleted' }, '400': { description: 'Error' } }
      }
    },
    '/student-verifications/import': {
      post: {
        tags: ['Student Verifications'],
        summary: 'Bulk import student verifications',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { entries: { type: 'array', items: { type: 'object' } } } } } } },
        responses: { '201': { description: 'Import summary' }, '400': { description: 'Validation error' } }
      }
    },
    '/students/{id}': {
      delete: {
        tags: ['Students'],
        summary: 'Delete student',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Student deleted' }, '400': { description: 'Error' } }
      }
    },
    '/notifications/stream': {
      get: {
        tags: ['Notifications'],
        summary: 'Stream notifications (SSE)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Server-sent events stream' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'All marked as read' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/templates/{id}': {
      patch: {
        tags: ['Templates'],
        summary: 'Update template',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Template updated' }, '400': { description: 'Validation error' }, '403': { description: 'Requires Coordinator or Admin role' } }
      },
      delete: {
        tags: ['Templates'],
        summary: 'Delete template',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Template deleted' }, '400': { description: 'Validation error' }, '403': { description: 'Requires Coordinator or Admin role' } }
      }
    },
    '/defense': {
      get: {
        tags: ['Defense'],
        summary: 'List defense records',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Array of defense records' }, '401': { description: 'Unauthorized' } }
      },
      post: {
        tags: ['Defense'],
        summary: 'Create defense record (Coordinator/Admin)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Defense created' }, '400': { description: 'Validation error' }, '403': { description: 'Requires Coordinator or Admin role' } }
      }
    },
    '/defense/availability': {
      get: {
        tags: ['Defense'],
        summary: 'Check defense availability',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'start_at', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'end_at', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'examinerId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Availability status' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/defense/{id}': {
      patch: {
        tags: ['Defense'],
        summary: 'Update defense record (Coordinator/Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Defense updated' }, '400': { description: 'Validation error' }, '403': { description: 'Requires Coordinator or Admin role' } }
      },
      delete: {
        tags: ['Defense'],
        summary: 'Cancel defense (Coordinator/Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Defense cancelled' }, '400': { description: 'Validation error' }, '403': { description: 'Requires Coordinator or Admin role' } }
      }
    },
    '/defense/{id}/duplicate': {
      post: {
        tags: ['Defense'],
        summary: 'Duplicate defense record (Coordinator/Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Defense duplicated' }, '400': { description: 'Validation error' }, '403': { description: 'Requires Coordinator or Admin role' } }
      }
    },
    '/defense/{id}/request-change': {
      post: {
        tags: ['Defense'],
        summary: 'Request defense change (Researcher)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Change requested' }, '400': { description: 'Validation error' } }
      }
    },
    '/defense/{id}/respond': {
      post: {
        tags: ['Defense'],
        summary: 'Respond to defense change request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Response saved' }, '400': { description: 'Validation error' } }
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















