import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { OrdersServiceImpl } from '../src/modules/orders/services/orders.service.impl';
import { OrdersRepository } from '../src/modules/orders/repositories/orders.repository';

describe('OrdersServiceImpl', () => {
  let service: OrdersServiceImpl;
  let ordersRepository: jest.Mocked<OrdersRepository>;
  let httpService: jest.Mocked<HttpService>;

  const mockOrder = {
    id: 'ord-123',
    itemId: 'item-1',
    quantity: 2,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const mockHttp = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersServiceImpl,
        { provide: OrdersRepository, useValue: mockRepo },
        { provide: HttpService, useValue: mockHttp },
      ],
    }).compile();

    service = module.get<OrdersServiceImpl>(OrdersServiceImpl);
    ordersRepository = module.get(OrdersRepository);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should deduct inventory, save order, and send notification successfully', async () => {
      httpService.post.mockReturnValue(
        of({ data: { success: true }, status: 200 } as any),
      );
      ordersRepository.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder({
        itemId: 'item-1',
        quantity: 2,
      });

      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/inventory/deduct'),
        { sku: 'item-1', quantity: 2 },
      );
      expect(ordersRepository.create).toHaveBeenCalledWith({
        itemId: 'item-1',
        quantity: 2,
        status: 'PENDING',
      });
      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        expect.objectContaining({ channel: 'EMAIL' }),
      );
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error and not save order if inventory deduction fails', async () => {
      httpService.post.mockReturnValue(
        throwError(() => new Error('Insufficient stock')),
      );

      await expect(
        service.createOrder({ itemId: 'item-1', quantity: 50 }),
      ).rejects.toThrow('Order Failed: Inventory deduction failed for item-1');

      expect(ordersRepository.create).not.toHaveBeenCalled();
    });

    it('should still succeed if notification service fails (soft-fail)', async () => {
      // First call (inventory) succeeds, second call (notification) fails
      httpService.post
        .mockReturnValueOnce(
          of({ data: { success: true }, status: 200 } as any),
        )
        .mockReturnValueOnce(
          throwError(() => new Error('Notification service unreachable')),
        );

      ordersRepository.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder({
        itemId: 'item-1',
        quantity: 2,
      });

      expect(result).toEqual(mockOrder);
      expect(ordersRepository.create).toHaveBeenCalled();
    });
  });

  describe('getOrders', () => {
    it('should return all orders from repository', async () => {
      ordersRepository.findAll.mockResolvedValue([mockOrder]);

      const result = await service.getOrders();

      expect(ordersRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockOrder]);
    });
  });
});
