import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from './tracking.controller';
import { EventRepository } from '../repositories/event.repository';
import { GetDailyTokenAmountsDto, GetTokenSummaryDto } from './dto';

describe('TrackingController', () => {
  let controller: TrackingController;
  let eventRepository: EventRepository;

  const mockEventRepository = {
    getDailyTokenAmounts: jest.fn(),
    getTokenSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        {
          provide: EventRepository,
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    controller = module.get<TrackingController>(TrackingController);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDailyTokenAmounts', () => {
    it('should return daily token amounts', async () => {
      const mockData = [
        {
          date: '2024-01-01',
          mintedAmount: '1000',
          redeemedAmount: '500',
        },
      ];

      mockEventRepository.getDailyTokenAmounts.mockResolvedValue(mockData);

      const result = await controller.getDailyTokenAmounts({
        chainName: 'ethereum',
        assetTokenAddress: '0x1234567890123456789012345678901234567890',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.success).toBe(true);
      expect(result.data?.dailyAmounts).toEqual(mockData);
      expect(mockEventRepository.getDailyTokenAmounts).toHaveBeenCalledWith(
        'ethereum',
        '0x1234567890123456789012345678901234567890',
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  describe('getTokenSummary', () => {
    it('should return token summary', async () => {
      const mockSummary = {
        totalMinted: '10000',
        totalRedeemed: '5000',
        totalEvents: 10,
      };

      mockEventRepository.getTokenSummary.mockResolvedValue(mockSummary);

      const result = await controller.getTokenSummary({
        chainName: 'ethereum',
        assetTokenAddress: '0x1234567890123456789012345678901234567890',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.success).toBe(true);
      expect(result.data?.summary).toEqual(mockSummary);
      expect(mockEventRepository.getTokenSummary).toHaveBeenCalledWith(
        'ethereum',
        '0x1234567890123456789012345678901234567890',
        expect.any(Date),
        expect.any(Date)
      );
    });
  });
}); 