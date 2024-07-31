import {EveryUser, HomeTwo, Timeline, DataFile, User} from "@icon-park/react";
import { colorPrimary } from "@/components/Theme";

export default {
  route: {
    path: '/',
    routes: [
      {
        path: '/project/home',
        name: '首页',
        icon: <HomeTwo theme="filled" size="18" fill={colorPrimary} strokeWidth={2}/>,
      },
      {
        path: '/project/recent',
        name: '最近',
        icon: <Timeline theme="filled" size="18" fill={colorPrimary} strokeWidth={2}/>,
      },
      {
        path: '/project/person',
        name: '个人',
        icon: <User theme="filled" size="18" fill={colorPrimary} strokeWidth={2}/>,
      },
      {
        path: '/project/group',
        name: '团队',
        icon: <EveryUser theme="filled" size="18" fill={colorPrimary} strokeWidth={2}/>,
      },
      {
        path: '/datav',
        name: 'Data Visualization',
        icon: <DataFile theme="filled" size="18" fill={colorPrimary} strokeWidth={2}/>,
      },
    ],
  },
  location: {
    pathname: '/',
  },
  appList: [
  ],
};
