import React from 'react';
import {Fill, Fixed, Right} from "react-spaces";
import ProjectHeader from "@/components/Header/ProjectHeader";
import ProjectLeftContent from "@/components/LeftContent/ProjectLeftContent";
import { ThemeProvider } from "@/components/Theme";

export type ProjectLayoutProps = {
  children: React.ReactNode | (() => React.ReactNode) | any;
};


const ProjectLayout: React.FC<ProjectLayoutProps> = (props) => {
  const {children} = props;

  return (
    <ThemeProvider>
    < Fixed width={"100%"} height={"100%"} className="bp4-dark dark-theme">
      <ProjectHeader/>
      <Fill>
        <ProjectLeftContent/>
        <Right size="88%">
          {children}
        </Right>
      </Fill>
    </Fixed>
    </ThemeProvider>
  )
};

export default React.memo(ProjectLayout);
