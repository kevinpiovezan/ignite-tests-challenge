import { hash } from "bcryptjs";
import request from 'supertest';
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from 'uuid'
import { app } from "../../../app";


let connection: Connection;
let id: string;
let id2: string;
let password: string;
let password2: string;
describe('Integrated Tests', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    id = uuidv4();
    id2 = uuidv4();
    password = await hash('userTests', 8);
    password2 = await hash('statementTests', 8);
    await connection.query(`INSERT INTO USERS(id, name, email, password, created_at) VALUES('${id}', 'test', 'users.controllers@test.com', '${password}', 'now()')`);
    await connection.query(`INSERT INTO USERS(id, name, email, password, created_at) VALUES('${id2}', 'test', 'statement.controllers@test.com', '${password2}', 'now()')`);

  });
  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'users.controllers@test.com',
      password: 'userTests'
    });
    expect(response.status).toBe(200);
  });
  it('should not be able to authenticate an user if password is wrong or missing', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'users.controllers@test.com',
      password: 'wrong'
    });
    expect(response.status).toBe(401);
  });
  it('should not be able to authenticate an user if email is wrong or missing', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'wrong@test.com',
      password: 'authenticatetest'
    });
    expect(response.status).toBe(401);
  });
  it('should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users/').send({
      name: "test",
      email: "create@test.com",
      password: "test"
    });
    expect(response.status).toBe(201);
  });
  it('should not be able to create a new user with the same email', async () => {
    const response = await request(app).post('/api/v1/users/').send({
      name: "test",
      email: "create@test.com",
      password: "test"
    });
    expect(response.status).toBe(400);
  });
  it('should be able to create a new deposit statement', async () => {
    const userResponse = await request(app).post('/api/v1/sessions').send({
      email: 'statement.controllers@test.com',
      password: 'statementTests'
    });

    const { token } = userResponse.body;


    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Create statement test',
    }).set({ Authorization: `Bearer ${token}` });
    expect(response.status).toBe(201);
  });
  it('should be able to create a new withdraw statement', async () => {
    const userResponse = await request(app).post('/api/v1/sessions').send({
      email: 'statement.controllers@test.com',
      password: 'statementTests'
    });

    const { token } = userResponse.body;


    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 50,
      description: 'Create statement test',
    }).set({ Authorization: `Bearer ${token}` });
    expect(response.status).toBe(201);
  });
  it('should not be able to create a statement if token is missing or invalid', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 50,
      description: 'Create statement test',
    }).set({ Authorization: `invalidToken` });
    expect(response.status).toBe(401);
  });
});
