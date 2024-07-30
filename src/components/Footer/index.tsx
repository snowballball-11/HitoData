import React from 'react';
import './index.less'

export type FooterProps = {};

const Footer: React.FC<FooterProps> = (props) => {
  return (<><a className="copyright" href="">2024@HitoData</a></>)
};

export default React.memo(Footer);
