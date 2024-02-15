import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  houses_api: {
    base_url: 'https://app-homevision-staging.herokuapp.com/api_project/houses',
  },
}));
