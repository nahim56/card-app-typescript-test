import { server } from "../src/server"

import Prisma from "../src/db";
import { FastifyInstance } from 'fastify';
import { build } from "../src/server";

describe("server test", () => {
  it("should assert 1 + 1 is 2", () => {
    expect(1 + 1).toEqual(2);
  });
});



describe('Test server is running', () => {
  let app: FastifyInstance;
  app = build();

  test('GET returns status 200 and message', async () => {
    const response = await app.inject({ method: 'GET', url: '/'});

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('{"hello":"world"}');
  });
});

describe('Get all test entries', () => {
  let app: FastifyInstance;
  app = build()

  const mockEntries = [
    { id: '1', title: 'title 1', description: 'desc 1', created_at: new Date('2024-01-01T10:00:00Z'), scheduled_for: new Date('2024-01-02T10:00:00Z') },
    { id: '2', title: 'title 2', description: 'desc 2', created_at: new Date('2024-01-03T11:00:00Z'), scheduled_for: new Date('2024-01-04T11:00:00Z') }
  ];
  jest.spyOn(Prisma.entry, 'findMany').mockResolvedValue(mockEntries);

  test('Get entries', async () => {
    const response = await app.inject({ method: 'GET',url: '/get/'});

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify(mockEntries)); 
  });

});

describe('GET entry based on ID', () => {
  let app: FastifyInstance;
  app = build();


  test('returns entry when given id', async () => {
    const mockEntry = { id: '1', title: 'title 1', description: 'desc 1', created_at: new Date('2024-01-01T10:00:00Z'), scheduled_for: new Date('2024-01-02T10:00:00Z')};

    jest.spyOn(Prisma.entry, 'findUnique').mockResolvedValue(mockEntry);

    const response = await app.inject({method: 'GET',url: '/get/1'});

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(mockEntry.id);
    expect(response.json().description).toBe(mockEntry.description);
    expect(new Date(response.json().created_at).getTime()).toBe(mockEntry.created_at.getTime());
    expect(new Date(response.json().scheduled_for).getTime()).toBe(mockEntry.scheduled_for.getTime());
  });

  test('returns 500 if entry not found', async () => {
    jest.spyOn(Prisma.entry, 'findUnique').mockResolvedValue(null);

    const response = await app.inject({method: 'GET', url: '/get/2'});

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ msg: 'Error finding entry with id 2' });
  });
});


describe('POST /create/', () => {
  test('creates a new entry', async () => {
    let app: FastifyInstance;
    app = build()
    const mockEntry = { id: '1', title: 'title 1', description: 'desc 1', created_at: new Date('2024-01-01T10:00:00Z'), scheduled_for: new Date('2024-01-02T10:00:00Z')};

    jest.spyOn(Prisma.entry, 'create').mockResolvedValue(mockEntry);

    const response = await app.inject({method: 'POST',url: '/create/', payload: mockEntry});

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(mockEntry.id);
    expect(response.json().title).toBe(mockEntry.title);
    expect(response.json().description).toBe(mockEntry.description);
    expect(new Date(response.json().created_at).getTime()).toBe(mockEntry.created_at.getTime());
    expect(new Date(response.json().scheduled_for).getTime()).toBe(mockEntry.scheduled_for.getTime());
  });
});

describe('DELETE /delete/:id', () => {
  let app: FastifyInstance;
  app = build()
  test('should delete an entry for a valid id', async () => {

    jest.spyOn(Prisma.entry, 'delete').mockResolvedValue({id: '1', title: 'title 1', description: 'desc 1', created_at: new Date('2024-01-01T10:00:00Z'),scheduled_for: new Date('2024-01-02T10:00:00Z')});

    const response = await app.inject({ method: 'DELETE', url: `/delete/1`});

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ msg: 'Deleted successfully' });
  });

  test('returns 500 if entry to be deleted is not found. ', async () => {

    jest.spyOn(Prisma.entry, 'delete').mockRejectedValue(Error);

    const response = await app.inject({ method: 'DELETE',url: `/delete/2`});

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ msg: 'Error deleting entry' });
  });
});

describe('Testing PUT', () => {
  let app: FastifyInstance;
  app = build()

  test('updates an entry for a existing id', async () => {
    const mockEntry = { id: '1', title: 'title 1', description: 'desc 1', created_at: new Date('2024-01-01T10:00:00Z'), scheduled_for: new Date('2024-01-02T10:00:00Z')};

    jest.spyOn(Prisma.entry, 'update').mockResolvedValue(mockEntry);

    const response = await app.inject({method: 'PUT',url: '/update/1',payload: mockEntry });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ msg: 'Updated successfully' });
  });
  test('does not update invalid id', async() => {
    const mockEntry = { id: '1', title: 'title 1', description: 'desc 1', created_at: new Date('2024-01-01T10:00:00Z'), scheduled_for: new Date('2024-01-02T10:00:00Z')};

    jest.spyOn(Prisma.entry, 'update').mockRejectedValue(Error);
    const response = await app.inject({method: 'PUT',url: '/update/2', payload: mockEntry});

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ msg: "Error updating" });

  })
});
