import React from 'react';
import {Alignment, Button, ButtonGroup, Navbar, NavbarDivider} from "@blueprintjs/core";
import {Left, Right, Top} from "react-spaces";
import {Popover2} from "@blueprintjs/popover2";
import useProjectStore from "@/store/project/useProjectStore";
import shallow from "zustand/shallow";
import './index.less';
import {NavigationMenu, ProjectMenu} from '@/components/Menu';

export type DesignHeaderProps = {};

const DesignHeader: React.FC<DesignHeaderProps> = (props) => {
  const {saved} = useProjectStore(state => ({
    saved: state.saved,
    projectDispatch: state.dispatch,
  }), shallow);
  return (
    <Top size="50px">
      <Left size={"80%"}>
        <Navbar>
          <Navbar.Group align={Alignment.CENTER}>
            <Popover2 content={<NavigationMenu/>} placement={"bottom-start"}>
              <Button icon={"menu"}/>
            </Popover2>
            <NavbarDivider/>
            <ButtonGroup minimal={true}>
              <Popover2 content={<ProjectMenu/>} placement={"bottom-start"}>
                <Button rightIcon={"caret-down"} text={"项目"}/>
              </Popover2>
            </ButtonGroup>
          </Navbar.Group>
        </Navbar>
      </Left>
      <Right size={"20%"}>
        <Navbar>
          <Navbar.Group align={Alignment.RIGHT}>
            <Button className="bp3-minimal" icon="people" title="用户"/>
            <NavbarDivider/>
            <Button className="bp3-minimal" icon="share" title="邀请协作"/>
            <NavbarDivider/>
            <Button className="bp3-minimal" icon="notifications" title="通知"/>
            <NavbarDivider/>
            <Button className="bp3-minimal" icon="chat" title="聊天"/>
            <NavbarDivider/>
            <Button className="bp3-minimal" intent={saved ? "success" : "danger"}
                    icon={saved ? "tick-circle" : "disable"} title={saved ? "已保存" : "未保存"}/>
          </Navbar.Group>
        </Navbar>
      </Right>
    </Top>
  )
};

export default React.memo(DesignHeader);
