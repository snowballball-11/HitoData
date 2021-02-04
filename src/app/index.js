import React from 'react';
import ReactDom from 'react-dom';
import _object from 'lodash/object';
import moment from 'moment';
import { Context, Icon, Message, Modal, openModal, Tab, Tree} from '../components';
import {Button as ErdButton} from '../components';
import {addOnResize} from '../../src/utils/listener';
import {generateMD} from '../../src/utils/markdown';
import {generateHtml} from '../../src/utils/generatehtml';
import {saveImage} from '../../src/utils/relation2file';
import {upgrade} from '../../src/utils/basedataupgrade';
import {moveArrayPosition} from '../../src/utils/array';
import Module from './container/module';
import Table from './container/table';
import DataType from './container/datatype';
import Database from './container/database';
import Relation from './container/relation';
import DatabaseVersion from './DatabaseVersion';
import ExportSQL from './ExportSQL';
import ExportImg from './ExportImg';
import ReadDB from './container/plugin/dbreverseparse/ReadDB';
import MultipleUtils from './container/multipleopt/MultipleUtils';

import * as File from '../utils/file';
import * as Save from '../utils/save';


import Setting from './Setting';

import './style/index.less';
import JDBCConfig from './JDBCConfig';
import SaveOutlined from "@ant-design/icons/es/icons/SaveOutlined";
import DeleteOutlined from "@ant-design/icons/es/icons/DeleteOutlined";
import CopyOutlined from "@ant-design/icons/es/icons/CopyOutlined";
import {Col, Divider, Menu, Row, Space,Button} from "antd";
import ArrowLeftOutlined from "@ant-design/icons/es/icons/ArrowLeftOutlined";
import SwaggerButton from "../components/swagger/button";
import SettingTwoTone from "@ant-design/icons/es/icons/SettingTwoTone";
import SaveTwoTone from "@ant-design/icons/es/icons/SaveTwoTone";
import ThunderboltTwoTone from "@ant-design/icons/es/icons/ThunderboltTwoTone";
import {createFromIconfontCN} from "@ant-design/icons";
import * as cache from "../utils/cache";
import {Link} from "react-router-dom";

const moduleUtils = Module.Utils;
const tableUtils = Table.Utils;
const DataTypeUtils = DataType.DataTypeUtils;
const DatabaseUtils = Database.Utils;
const TreeNode = Tree.TreeNode;
const TabPane = Tab.TabPane;
const menus = [
    {name: '新增', key: 'new', icon: <Icon type='addfolder' style={{color: '#008000', marginRight: 5}}/>},
    {name: '重命名', key: 'rename', icon: <Icon type='fa-undo' style={{color: '#F96B36', marginRight: 5}}/>},
    {name: '删除', key: 'delete', icon: <DeleteOutlined style={{color: '#FF0000', marginRight: 5}}/>},
    {name: '复制', key: 'copy', icon: <CopyOutlined style={{color: '#0078D7', marginRight: 5}}/>},
    {name: '剪切', key: 'cut', icon: <Icon type='fa-cut' style={{color: '#D2B3AF', marginRight: 5}}/>},
    {name: '粘贴', key: 'paste', icon: <Icon type='fa-paste' style={{color: '#6968E1', marginRight: 5}}/>},
    {name: '打开', key: 'open', icon: <Icon type='folderopen' style={{color: '#C3D6E8', marginRight: 5}}/>},
];

const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1485538_zhb6fnmux9a.js', // 在 iconfont.cn 上生成
});

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.flag = true;
        this.state = {
            tools: 'file',
            tab: 'table',
            width: 1,
            left: 0,
            top: 0,
            contextDisplay: 'none',
            contextMenus: [],
            leftTabWidth: 0,
            toolsClickable: 'file',
            clicked: 'edit',
            versions: [],
            dbVersion: '',
            //foldingTabs: [],
        };
        this.relationInstance = {};
        this.tableInstance = {};
    }

    componentDidMount() {
        /* eslint-disable */
        // 增加监听窗口大小的事件
        // console.log(this.props);
        // window.erd.loading(window, this.props);
        this.dom = ReactDom.findDOMNode(this.instance);
        this.weight = this.dom.getBoundingClientRect().width;
        this.leftTabDom = ReactDom.findDOMNode(this.leftTabInstance);
        addOnResize(this._setTabsWidth);
        /*document.onselectstart = (evt) => {
          // 阻止默认选中样式
          if (evt.target.tagName !== 'INPUT'
            && evt.target.tagName !== 'TEXTAREA'
            && evt.target.nodeName !== '#text'
            && evt.target.tagName !== 'PRE') {
            //evt.preventDefault();
          }
        };*/
        document.onkeydown = (e) => {
            if (e.shiftKey) {
                document.onselectstart = (evt) => {
                    evt.preventDefault();
                };
            } else {
                document.onselectstart = () => {
                    //evt.preventDefault();
                };
            }
        };
        document.onkeyup = () => {
            document.onselectstart = () => {
                //evt.preventDefault();
            };
        };
        document.onkeydown = (evt) => {
            if (evt.ctrlKey || evt.metaKey) {
                if (this.flag) {
                    if (evt.code === 'KeyS') {
                        this._saveAll();
                        evt.preventDefault();
                    } else if (evt.code === 'KeyE') {
                        // 关闭当前打开的tab
                        const {show} = this.state;
                        show && this._tabClose(show);
                        evt.preventDefault();
                    }
                }
            }
        };
        // 增量更新老版项目文件
        upgrade(this.props.dataSource, (data, flag) => {
            if (flag) {
                // 判断是否是演示项目
                const {saveProject, project} = this.props;
                project && saveProject({
                    ...data,
                }, () => {
                    Message.success({title: '项目基础数据已经成功自动更新到最新！'})
                });
            }
        });
        Save.hisProjectLoad().then((res) => {
            this.setState({
                versions: res && res.body || [],
            });
        });

        this.getBDVersion();
    }

    getBDVersion() {
        const projectId = cache.getItem('projectId');
        Save.dbversion({
            projectId: projectId, // eslint-disable-line
        }).then((res) => {
            if (res && res.status === 'SUCCESS') {
                Message.success({title: '数据库版本信息获取成功'});
            } else {
                Message.error({title: '数据库版本信息获取失败', message: res.body || res});
            }
            this.setState({
                dbVersion: res.status !== 'SUCCESS' ? '' : res.body,
            });
        }).catch((err) => {
            Message.error({title: '数据库版本信息获取失败', message: err.message});
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.project !== this.props.project) {
            // window.erd.loading(window, nextProps);
        }
    }

    componentWillUnmount() {
        this.flag = false;
    }

    asyncRun = (events = [], errors) => {
        // 顺序执行方法，方法返回的必须是promise
        const asyncRunEvents = async () => {
            for (let i = 0; i < events.length; i++) {
                await events[i]().catch((err) => {
                    errors.push(err);
                });
            }
        };
        return asyncRunEvents();
    };
    _getTabToFoldingTabs = () => {
        const {show, tabs = []} = this.state;
        const tempTabs = tabs.filter(tab => tab.key !== show).filter(tab => !tab.folding);
        return tempTabs.length > 0 && tempTabs[tempTabs.length - 1];
    };
    _setTabsWidth = () => {
        const {tabs = []} = this.state;
        this.weight = this.dom.getBoundingClientRect().width;
        // 根据父节点的don需要去校验tab的头列表能否完全显示
        // 每个头标题的宽度是151px
        // 获取当前显示的tabs数
        const tabShowLength = tabs.filter(tab => !tab.folding).length;
        const tabFoldingLength = tabs.filter(tab => tab.folding).length;
        if (this.weight - 25 < tabShowLength * 151) {
            // 将最后一个并且不是当前已经选中的tab放入折叠面板中
            const lastTab = this._getTabToFoldingTabs();
            this.flag && this.setState({
                tabs: tabs.map((tab) => {
                    if (tab.key === lastTab.key) {
                        return {
                            ...tab,
                            folding: true,
                        };
                    }
                    return tab;
                }),
            });
        } else if ((tabFoldingLength !== 0)
            && (this.weight - 25 >= ((tabShowLength + 1) * 151))) {
            const firstFoldingTab = tabs.filter(tab => tab.folding)[0];
            this.flag && this.setState({
                tabs: tabs.map((tab) => {
                    if (firstFoldingTab && firstFoldingTab.key === tab.key) {
                        return {
                            ...tab,
                            folding: false,
                        };
                    }
                    return tab;
                }),
            });
        }
        this.flag && this.setState({
            leftTabWidth: this.leftTabDom.getBoundingClientRect().width,
        });
    };
    _saveAs = (status) => {
        const {dataSource, project} = this.props;
        this._saveAll(() => {
            let tempDataSource = {...dataSource};
            if (status === 'filterDBS') {
                // 去除数据库信息
                tempDataSource = {
                    ...tempDataSource,
                    profile: {
                        ...(tempDataSource.profile || {}),
                        dbs: _object.get(tempDataSource, 'profile.dbs', []).map(d => {
                            return {
                                ...d,
                                properties: {
                                    url: '******',
                                    username: '******',
                                    password: '******',
                                },
                            }
                        }),
                    },
                };
            }
            File.save(JSON.stringify(tempDataSource, null, 2), `${project}.erd.json`);
        });
    };
    _updateDBs = (tempDBs, callback) => {
        const {dataSource, saveProject} = this.props;
        saveProject({
            ...dataSource,
            profile: {
                ...(dataSource.profile || {}),
                dbs: tempDBs,
            },
        }, () => {
            Message.success({title: '数据库连接信息已经成功保存！'});
            callback && callback();
        });
    };
    _getJavaConfig = () => {
        const {dataSource} = this.props;
        const dataSourceConfig = _object.get(dataSource, 'profile.javaConfig', {});
        if (!dataSourceConfig.JAVA_HOME) {
            dataSourceConfig.JAVA_HOME = process.env.JAVA_HOME || process.env.JER_HOME || '';
        }
        return dataSourceConfig;
    };
    _JDBCConfig = () => {
        const {project, dataSource} = this.props;
        let tempDBs = _object.get(dataSource, 'profile.dbs', []);
        const dbChange = (db) => {
            tempDBs = db;
        };
        openModal(<JDBCConfig
            onChange={dbChange}
            data={tempDBs}
            getJavaConfig={this._getJavaConfig}
            project={project}
            dataSource={dataSource}
        />, {
            title: '数据库连接配置',
            width: '60%',
            onOk: (m) => {
                const currentDB = tempDBs.filter(d => d.defaultDB)[0];
                if (!currentDB) {
                    Modal.confirm({
                        title: '提示',
                        message: '未选择默认数据库，是否继续？',
                        onOk: (modal) => {
                            modal && modal.close();
                            this._updateDBs(tempDBs, () => {
                                m && m.close();
                                modal && modal.close();
                            });
                        }
                    });
                } else {
                    this._updateDBs(tempDBs, () => {
                        m && m.close();
                    });
                }
            },
        });
    };
    _setting = () => {
        const {columnOrder, dataSource, project, register, updateRegister} = this.props;
        openModal(<Setting
            columnOrder={columnOrder}
            dataSource={dataSource}
            project={`${project}.erd.json`}
            register={register}
            updateRegister={updateRegister}
        />, {
            title: '配置默认数据',
            onOk: (modal, com) => {
                const {saveProject} = this.props;
                const data = com.getDataSource();
                saveProject({
                    ...dataSource,
                    ...data,
                }, () => {
                    modal && modal.close();
                });
            }
        });
    };
    _closeProject = () => {
        // 关闭项目回到工作台
        if (window.parent) {
            window.parent.location.href = `${window.parent.location.origin}/#/project`;
        }
    };
    _showExportMessage = () => {
        let modal = null;
        const {dataSource} = this.props;
        const allTable = (dataSource.modules || []).reduce((a, b) => {
            return a.concat((b.entities || []).map(entity => entity.title));
        }, []);
        if (allTable.length > 50) {
            modal = Modal.success({
                title: '导出提示',
                message: `当前导出的数据表较多，
        共【${allTable.length}】张表，请耐心等待！，导出结束后弹窗将自动关闭！`,
                footer: [],
            })
        }
        return modal;
    };
    _exportFile = (type, btn) => {
        const {dataSource, columnOrder, project} = this.props;
        if (type === 'Markdown') {
            // 先生成文件
            // 选择目录
            // 保存图片
            const modal = this._showExportMessage();
            btn && btn.setLoading(true);
            saveImage(dataSource, columnOrder, (images) => {
                generateMD(dataSource, images, project, (data) => {
                    // 将数据保存到文件
                    File.save(data, `${project}.md`);
                    modal && modal.close();
                    btn && btn.setLoading(false);
                });
            }, (err) => {
                modal && modal.close();
                btn && btn.setLoading(false);
                Modal.error({
                    title: `${type}导出失败!请重试！`,
                    message: `出错原因：${err.message}`,
                });
            });
        } else if (type === 'Word' || type === 'PDF') {
            //Message.warning({title: '该功能正在开发中，敬请期待！'})
            const postfix = type === 'Word' ? '.doc' : '.pdf';
            // 保存图片
            const modal = this._showExportMessage();
            btn && btn.setLoading(true);
            saveImage(dataSource, columnOrder, (images) => {
                const tempImages = Object.keys(images).reduce((a, b) => {
                    a[b] = images[b].replace('data:image/png;base64,', '');
                    return a;
                }, {});
                Save.gendocx({
                    imgs: tempImages,
                    outext: postfix,
                }).then((res) => {
                    File.saveByBlob(res, `${project}${postfix}`);
                    modal && modal.close();
                }).catch((err) => {
                    Modal.error({
                        title: `${type}导出失败!请重试！`,
                        message: `出错原因：${err.message}`,
                    });
                }).finally(() => {
                    btn && btn.setLoading(false);
                });
            }, (err) => {
                modal && modal.close();
                btn && btn.setLoading(false);
                Modal.error({
                    title: `${type}导出失败!请重试！`,
                    message: `出错原因：${err.message}`,
                });
            });
        } else if (type === 'Html') {
            const modal = this._showExportMessage();
            btn && btn.setLoading(true);
            saveImage(dataSource, columnOrder, (images) => {
                generateHtml(dataSource, images, project, (data) => {
                    File.save(data, `${project}.html`);
                    modal && modal.close();
                    btn && btn.setLoading(false);
                });
            }, (err) => {
                modal && modal.close();
                btn && btn.setLoading(false);
                Modal.error({
                    title: `${type}导出失败!请重试！`,
                    message: `出错原因：${err.message}`,
                });
            });
        } else if (type === 'SQL') {
            const database = _object.get(dataSource, 'dataTypeDomains.database', []);
            const defaultDb = (database.filter(db => db.defaultDatabase)[0] || {}).code;
            let modal = null;
            const onOk = () => {
                const exportConfig = modal.com.getValue();
                const value = exportConfig.value;
                if (value.length === 0) {
                    Modal.error({title: '导出失败', message: '请选择导出的内容'})
                } else {
                    const data = modal.com.getData();
                    File.save(data, `${moment().format('YYYY-MM-D-h-mm-ss')}.sql`);
                    modal && modal.close();
                }
            };
            const onCancel = () => {
                modal && modal.close();
            };
            modal = openModal(<ExportSQL
                defaultDb={defaultDb}
                database={database}
                dataSource={dataSource}
                exportSQL={onOk}
                configJSON={this.props.configJSON}
                updateConfig={this.props.updateConfig}
            />, {
                title: 'SQL导出配置',
                footer: [
                    //<Button key="ok" onClick={onOk} type="primary" style={{marginTop: 10}}>保存</Button>,
                    <Button key="cancel" onClick={onCancel} style={{marginLeft: 10, marginTop: 10}}>关闭</Button>
                ],
            });
        }
    };
    _export = () => {
        // 打开弹窗，选择导出html或者word
        openModal(<div style={{textAlign: 'center', padding: 10}}>
            <ErdButton onClick={(btn) => this._exportFile('Html', btn)}>导出HTML</ErdButton>
            {/*      <Button icon='wordfile1' style={{marginLeft: 40}} onClick={(btn) => this._exportFile('Word', btn)}>导出WORD</Button>
      <Button icon='pdffile1' style={{marginLeft: 40}} onClick={(btn) => this._exportFile('PDF', btn)}>导出PDF</Button>*/}
            <ErdButton style={{marginLeft: 40}}
                    onClick={(btn) => this._exportFile('Markdown', btn)}>导出MARKDOWN</ErdButton>
        </div>, {
            width: '40%',
            title: '文件导出'
        })
    };
    _exportSQL = () => {
        this._exportFile('SQL');
    };
    _readPDMfile = () => {
        Message.error({title: '此功能正在玩命开发中，敬请期待...'});
    };
    _readDB = () => {
        let modal = null;
        const onClickCancel = () => {
            modal && modal.close();
        };
        const success = (keys, data) => {
            if (keys.length > 0) {
                const {saveProject, dataSource} = this.props;
                const dbType = _object.get(data, 'dbType', 'MYSQL');
                const module = _object.get(data, 'module', {});
                const datatypeObj = _object.get(data, 'dataTypeMap', {});
                let currentDataTypes = _object.get(dataSource, 'dataTypeDomains.datatype', []);
                const database = _object.get(dataSource, 'dataTypeDomains.database', []);
                if (!database.some(d => d.code === dbType)) {
                    database.push({
                        code: dbType
                    });
                }
                const currentDataTypeCodes = currentDataTypes.map(t => t.code);
                const dataTypes = Object.keys(datatypeObj)
                    .map(d => ({
                        name: datatypeObj[d].name,
                        code: datatypeObj[d].code,
                        apply: {
                            [dbType]: {
                                type: datatypeObj[d].type
                            }
                        }
                    })).filter(d => !currentDataTypeCodes.includes(d.code));
                currentDataTypes = currentDataTypes.map(c => {
                    if (datatypeObj[c.code]) {
                        return {
                            ...c,
                            apply: {
                                ...(c.apply || {}),
                                [dbType]: {
                                    type: datatypeObj[c.code].type
                                }
                            }
                        }
                    }
                    return c;
                });
                let tempKeys = [...keys];
                modal && modal.close();
                let tempData = {...dataSource};
                // 1.循环所有已知的数据表
                let modules = (tempData.modules || []).map(m => ({
                    ...m,
                    entities: (m.entities || []).map(e => {
                        // 执行覆盖操作
                        const dbEntity = keys.filter(k => k.title === e.title)[0];
                        if (dbEntity) {
                            tempKeys = tempKeys.filter(t => t.title !== dbEntity.title);
                        }
                        return dbEntity || e;
                    })
                }));
                if (modules.map(m => m.name).includes(module.code)) {
                    // 如果该模块已经存在了
                    modules = modules.map(m => {
                        if (m.name === module.code) {
                            return {
                                ...m,
                                entities: (m.entities || []).concat(tempKeys),
                            };
                        }
                        return m;
                    })
                } else {
                    modules.push({
                        name: module.code,
                        chnname: module.name,
                        entities: tempKeys
                    });
                }
                tempData = {
                    ...tempData,
                    modules,
                    dataTypeDomains: {
                        ...(dataSource.dataTypeDomains || {}),
                        datatype: currentDataTypes.concat(dataTypes),
                        database,
                    },
                };
                // 2.将剩余的数据表放置于新模块
                saveProject(tempData, () => {
                    Message.success({title: '操作成功！'})
                });
            }
        };
        modal = openModal(<ReadDB {...this.props} success={success}/>, {
            title: '解析已有数据库',
            width: '50%',
            footer: [<Button key="cancel" onClick={onClickCancel}>关闭</Button>]
        })
    };
    _saveAll = (callBack) => {
        const {project, dataSource} = this.props;
        // 1.循环调用当前所有tab的保存方法, 并且返回的都是promise
        const relations = Object.keys(this.relationInstance)
            .filter(key => this.relationInstance[key])
            .map(key => this.relationInstance[key].promiseSave)
            .filter(fuc => !!fuc);
        const tables = Object.keys(this.tableInstance)
            .filter(key => this.tableInstance[key])
            .map(key => this.tableInstance[key].promiseSave)
            .filter(fuc => !!fuc);
        const functions = tables.concat(relations);
        if (functions.length > 0) {
            this.errors = [];
            this.asyncRun(functions, this.errors).then(() => {
                callBack && callBack();
                if (!this.errors || this.errors.length === 0) {
                    //Modal.success({title: '保存成功', message: '保存成功', width: 200})
                    !callBack && Message.success({title: '保存成功'});
                } else {
                    Modal.error({title: '保存失败', message: this.errors.join(',')})
                }
            });
        } else {
            if (project) {
                !callBack && Message.success({title: '保存成功'});
                callBack && callBack();
            } else {
                File.save(JSON.stringify(dataSource, null, 2), `${project}.erd.json`);
            }
        }
    };
    _menuClick = (tools) => {
        if (tools === "openDev") {

        } else {
            this.setState({
                tools,
            });
            Save.hisProjectLoad().then((res) => {
                this.setState({
                    versions: res && res.body || [],
                });
            });
        }
    };
    _leftTabChange = (tab) => {
        this.setState({
            tab,
        });
    };
    _closeLeftTab = () => {
        const {width} = this.state;
        this.setState({
            width: width === 0 ? 1 : 0,
        }, () => {
            this._setTabsWidth();
            this.treeInstance && this.treeInstance.resetSearchWidth();
        });
    };
    _refresh = () => {
        Modal.confirm({
            title: '刷新提示',
            message: '重新加载数据可能会使未保存的数据丢失，是否要继续？',
            onOk: (modal) => {
                modal && modal.close();
                const {refresh} = this.props;
                refresh && refresh();
            },
            width: 350
        });
    };
    _changeMode = (mode) => {
        const {show} = this.state;
        this.setState({
            clicked: mode,
        });
        this.relationInstance[show] && this.relationInstance[show].changeMode(mode);
    };
    _tabChange = () => {
        const {show, tabs} = this.state;
        let tempTools = 'file';
        if (show.includes('/关系图/')) {
            tempTools = 'map'
        } else if (show.endsWith('/fa-table')) {
            tempTools = 'entity';
        }
        tabs.length !== 0 && this.setState({
            toolsClickable: tempTools,
            tools: tempTools,
        })
    };
    _tabHeaderClick = (value) => {
        const {tabs = []} = this.state;
        this.setState({
            show: value,
            tabs: tabs.map((tab) => {
                if (tab.key === value) {
                    return {
                        ...tab,
                        folding: false,
                    };
                }
                return tab;
            }),
        }, () => {
            this._setTabsWidth();
            this._tabChange();
        });
    };
    _getTabsAndShow = (datas, value) => {
        let tempTabs = [...datas];
        const index = datas.findIndex(tab => tab.key === value);
        return {
            show: datas[index - 1 < 0 ? index + 1 : index - 1],
            tabs: tempTabs.filter(tab => tab.key !== value),
        }
    };
    _checkShowTab = (tabs = [], show) => {
        // 如果显示的是收起的则需要更换显示的tab
        if (tabs.length > 0) {
            const showTabIndex = tabs.findIndex(tab => tab.key === show);
            const showTab = tabs[showTabIndex];
            if (!showTab.folding) {
                return show;
            }
            return this._checkShowTab(tabs, tabs[showTabIndex === 0 ? 0 : (showTabIndex - 1)].key)
        }
        return show;
    };
    _tabClose = (value) => {
        const {tabs, show, tools} = this.state;
        const tempValue = [].concat(value);
        if (tempValue.length > 0) {
            const result = tempValue.reduce((a, b) => {
                return this._getTabsAndShow(a.tabs, b);
            }, {tabs});
            this.setState({
                tabs: result.tabs,
                show: this._checkShowTab(result.tabs, ((show === value) && result.show && result.show.key) || show),
                tools: result.tabs.length === 0 ? 'file' : tools,
            }, () => {
                this._setTabsWidth();
                this._tabChange();
            });
        }
    };
    _getIconByKey = (type) => {
        let icon = '';
        switch (type) {
            case 'map&':
                icon = 'fa-wpforms';
                break;
            case 'entity&':
                icon = 'fa-table';
                break;
            case 'datatype&data&':
                icon = 'fa-viacoin';
                break;
            case 'database&data&':
                icon = 'fa-database';
                break;
            default:
                break;
        }
        return icon;
    };
    _getTabKey = (value, keyTypes = []) => {
        const currentType = keyTypes.filter(type => value.startsWith(type))[0];
        if (currentType) {
            return {
                value: value.split(currentType)[1],
                icon: this._getIconByKey(currentType),
            };
        }
        return {
            value: '',
            icon: '',
        };
    };
    _updateTabs = (module, table, value, newModule) => {
        const {tabs, show} = this.state;
        if (tabs && tabs.length > 0) {
            const oldValue = `${module}&${table}`;
            const newValue = `${newModule || module}&${value}`;
            this.setState({
                dataHistory: newModule ? {} : {oldName: table, newName: value},
                tabs: tabs.map((tab) => {
                    if (tab.title === oldValue) {
                        return {
                            ...tab,
                            title: newValue,
                            key: `${newValue}/fa-table`,
                            value: `entity&${newValue}`,
                        };
                    }
                    return tab;
                }),
                show: show === `${oldValue}/fa-table` ? `${newValue}/fa-table` : show,
            }, () => {
                this._tabChange();
            });
        }
    };
    _getCpt = (value) => {
        if (value.startsWith('map&')) {
            return (<Relation/>);
        } else if (value.startsWith('entity&')) {
            return (<Table/>);
        }
        return '';
    };
    _getTabRealName = (value) => {
        const {dataSource} = this.props;
        const newTempValues = value.replace('&', '/').split('/');
        let tempTitle = value;
        const module = newTempValues[0];
        const entity = newTempValues[1];
        const moduleData = (dataSource.modules || []).filter(m => m.name === module)[0];
        let entityData = null;
        if (moduleData) {
            entityData = (moduleData.entities || []).filter(e => e.title === entity)[0];
        }
        if (entityData) {
            tempTitle = entityData && this._getTableNameByNameTemplate(entityData);
        } else {
            tempTitle = `${module}[${entity}]`
        }
        return tempTitle;
    };
    _onDoubleClick = (value) => {
        const {dataSource, project, saveProject} = this.props;
        if (value.startsWith('datatype&data&')) {
            DataTypeUtils.renameDataType(value.split('datatype&data&')[1], dataSource, (data) => {
                saveProject(data);
            });
        } else if (value.startsWith('database&data&')) {
            DatabaseUtils.renameDatabase(value.split('database&data&')[1], dataSource, (data) => {
                saveProject(data);
            });
        } else {
            const types = ['map&', 'entity&'];
            const tempValue = this._getTabKey(value, types);
            if (tempValue.value) {
                const {tabs = []} = this.state;
                // 检查key是否已经存在
                let tempTabs = [...tabs];
                if (!tempTabs.some(tab => tab.key === `${tempValue.value}/${tempValue.icon}`)) {
                    tempTabs.push(
                        {
                            title: tempValue.value,
                            key: `${tempValue.value}/${tempValue.icon}`,
                            value,
                            icon: tempValue.icon,
                            folding: false,
                            com: this._getCpt(value, `${tempValue.value}/${tempValue.icon}`)
                        });
                } else {
                    tempTabs = tempTabs.map((tab) => {
                        if (tab.key === `${tempValue.value}/${tempValue.icon}`) {
                            return {
                                ...tab,
                                folding: false,
                            };
                        }
                        return tab;
                    });
                }
                this.setState({
                    tabs: tempTabs,
                    show: `${tempValue.value}/${tempValue.icon}`,
                }, () => {
                    this._setTabsWidth();
                    this._tabChange();
                });
            }
        }
    };
    _onContextMenu = (e, value, checked) => {
        let contextMenus = [];
        // 计算需要复制的内容
        if (checked.length > 1) {
            contextMenus = [{
                name: <span><Icon type='copy1' style={{color: '#0078D7', marginRight: 5}}/>复制</span>,
                key: `multiple&copy&${value}`,
                checked
            }]
        } else {
            if (value.startsWith('module&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{menu.icon}{menu.key === 'new' ? '新增模块' : menu.name}</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => !menu.key.startsWith('open&')));
            } else if (value.startsWith('map&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{menu.icon}打开关系图</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => menu.key.startsWith('open&')));
            } else if (value.startsWith('table&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{
                            menu.key === 'new' ?
                                <Icon type='fa-table' style={{color: '#008000', marginRight: 5}}/> : menu.icon
                        }{menu.key === 'new' ? '新增数据表' : menu.name}</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => !menu.key.startsWith('open&') &&
                    !menu.key.startsWith('delete&') && !menu.key.startsWith('rename&')));
            } else if (value.startsWith('datatype&data&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{menu.icon}{menu.key === 'new' ? '新增数据类型' : menu.name}</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => !menu.key.startsWith('open&')));
            } else if (value.startsWith('database&data&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{menu.icon}{menu.key === 'new' ? '新增数据库' : menu.name}</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => !menu.key.startsWith('open&')));
            } else if (value.startsWith('entity&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{
                            menu.key === 'new' ?
                                <Icon type='fa-table' style={{color: '#008000', marginRight: 5}}/> : menu.icon
                        }
                            {menu.key === 'new' ? '新增数据表' : menu.name}</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => !menu.key.startsWith('open&')));
            } else if (value.startsWith('datatype&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{menu.icon}{menu.key === 'new' ? '新增数据类型' : menu.name}</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => !menu.key.startsWith('open&') && !menu.key.startsWith('rename&')));
            } else if (value.startsWith('database&')) {
                contextMenus = contextMenus.concat(menus.map((menu) => {
                    return {
                        ...menu,
                        name: <span>{menu.icon}{menu.key === 'new' ? '新增数据库' : menu.name}</span>,
                        key: `${menu.key}&${value}`,
                    };
                }).filter(menu => !menu.key.startsWith('open&') && !menu.key.startsWith('rename&')));
            }
        }
        this.setState({
            left: e.clientX,
            top: e.clientY,
            contextDisplay: '',
            contextMenus,
        });
    };

    _closeContextMenu = () => {
        this.setState({
            contextDisplay: 'none',
        });
    };
    _contextClick = (e, key, menu) => {
        // 右键菜单的所有出口
        // key: new&module&name
        // 1.根据&裁剪
        const keyArray = key.split('&');
        if (keyArray[1]) {
            if (keyArray[1] === 'module') {
                this._handleModule(keyArray);
            } else if (keyArray[1] === 'table'
                || keyArray[1] === 'entity') {
                this.handleTable(keyArray);
            } else if (keyArray[1] === 'datatype') {
                this.handleDataType(keyArray);
            } else if (keyArray[1] === 'database') {
                this.handleDatabase(keyArray);
            } else if (keyArray[1] === 'map') {
                // 切换到关系图的Tab
                // open&map&qqq/关系图
                // map&qqq/关系图
                this._onDoubleClick(key.split('open&')[1]);
            } else {
                // 多选复制
                MultipleUtils.opt(key, menu, this.props.dataSource);
            }
        }
        // console.log(key);
    };
    handleDatabase = (key) => {
        const {dataSource, project, saveProject} = this.props;
        const optType = key[0];
        const databaseCode = key[3] || '';
        switch (optType) {
            case 'new':
                DatabaseUtils.addDatabase(dataSource, (data) => {
                    saveProject(data);
                });
                break;
            case 'rename':
                DatabaseUtils.renameDatabase(databaseCode, dataSource, (data) => {
                    saveProject(data);
                });
                break;
            case 'delete':
                Modal.confirm(
                    {
                        title: '删除提示',
                        message: `确定删除数据库【${databaseCode}】吗？删除后不可恢复！`,
                        width: 400,
                        onOk: (modal) => {
                            modal && modal.close();
                            DatabaseUtils.deleteDatabase(databaseCode, dataSource, (data) => {
                                saveProject(data);
                            });
                        }
                    });
                break;
            case 'copy':
                DatabaseUtils.copyDatabase(databaseCode, dataSource);
                break;
            case 'cut':
                DatabaseUtils.cutDatabase(databaseCode, dataSource);
                break;
            case 'paste':
                DatabaseUtils.pasteDatabase(dataSource, (data) => {
                    saveProject(data);
                });
                break;
            default:
                break;
        }
    };
    handleDataType = (key) => {
        const {dataSource, project, saveProject} = this.props;
        const optType = key[0];
        const dataTypeCode = key[3] || '';
        switch (optType) {
            case 'new':
                DataTypeUtils.addDataType(dataSource, (data) => {
                    saveProject(data);
                });
                break;
            case 'rename':
                DataTypeUtils.renameDataType(dataTypeCode, dataSource, (data) => {
                    saveProject(data);
                });
                break;
            case 'delete':
                Modal.confirm(
                    {
                        title: '删除提示',
                        message: `确定删除数据类型【${dataTypeCode}】吗？删除后不可恢复！`,
                        width: 400,
                        onOk: (modal) => {
                            modal && modal.close();
                            DataTypeUtils.deleteDataType(dataTypeCode, dataSource, (data) => {
                                saveProject(data);
                            });
                        }
                    });
                break;
            case 'copy':
                DataTypeUtils.copyDataType(dataTypeCode, dataSource);
                break;
            case 'cut':
                DataTypeUtils.cutDataType(dataTypeCode, dataSource);
                break;
            case 'paste':
                DataTypeUtils.pasteDataType(dataSource, (data) => {
                    saveProject(data);
                });
                break;
            default:
                break;
        }
    };
    handleTable = (key) => {
        const {dataSource, project, saveProject} = this.props;
        const optType = key[0];
        const module = key[2];
        const table = key[3] !== '数据表' ? key[3] : '';
        switch (optType) {
            case 'new':
                tableUtils.addTable(module, dataSource, (data) => {
                    saveProject(data);
                });
                break;
            case 'rename':
                tableUtils.renameTable(module, table, dataSource, (data, dataHistory) => {
                    saveProject(data, () => {
                        const {tabs = [], show} = this.state;
                        let tempShow = show;
                        const newTable = dataHistory.newName;
                        this.setState({
                            tabs: tabs.map((tab) => {
                                const key = tab.key.replace('/', '&').split('&');
                                const module = key[0];
                                const oldTable = key[1];
                                if (oldTable === table) {
                                    // 检查当前tab是否已经显示
                                    const newKey = `${module}&${newTable}/fa-table`;
                                    if (tempShow === tab.key) {
                                        tempShow = newKey;
                                    }
                                    return {
                                        ...tab,
                                        title: `${module}&${newTable}`,
                                        key: newKey,
                                        value: `entity&${module}&${newTable}`,
                                    };
                                }
                                return tab;
                            }),
                            show: show !== tempShow ? tempShow : show,
                        })
                    }, dataHistory);
                });
                break;
            case 'delete':
                Modal.confirm(
                    {
                        title: '删除提示',
                        message: `确定删除数据表【${table}】吗？删除后不可恢复！`,
                        width: 400,
                        onOk: (modal) => {
                            modal && modal.close();
                            tableUtils.deleteTable(module, table, dataSource, (data) => {
                                saveProject(data, () => {
                                    // 测试模块_Customer-fa-table
                                    const {tabs = []} = this.state;
                                    if (tabs.map(tab => tab.key).includes(`${module}&${table}/fa-table`)) {
                                        this._tabClose(`${module}&${table}/fa-table`);
                                    }
                                });
                            });
                        }
                    });
                break;
            case 'copy':
                tableUtils.copyTable(module, table, dataSource);
                break;
            case 'cut':
                tableUtils.cutTable(module, table, dataSource);
                break;
            case 'paste':
                tableUtils.pasteTable(module, dataSource, (data) => {
                    saveProject(data);
                });
                break;
            default:
                break;
        }
    };
    _emptyClick = () => {
        const {dataSource, project, saveProject} = this.props;
        moduleUtils.addModule(dataSource, (data) => {
            saveProject(data);
        });
    };
    _handleModule = (key) => {
        const {dataSource, project, saveProject} = this.props;
        const optType = key[0];
        switch (optType) {
            case 'new':
                moduleUtils.addModule(dataSource, (data) => {
                    saveProject(data);
                });
                break;
            case 'rename':
                moduleUtils.renameModule(key[2], dataSource, (data, newModule) => {
                    saveProject(data, () => {
                        // 如果有当前模块中已经打开的tab，则需要对其进行更新
                        const {tabs = [], show} = this.state;
                        const oldModule = key[2];
                        let tempShow = show;
                        this.setState({
                            tabs: tabs.map((tab) => {
                                const key = tab.key.replace('/', '&').split('&');
                                const module = key[0];
                                const table = key[1];
                                if (module === oldModule) {
                                    // 关系图和实体的key的格式不一致
                                    const type = tab.key.includes('&') ? 'entity' : 'map';
                                    // 检查当前tab是否已经显示
                                    const newKey = type === 'entity' ? `${newModule}&${table}/fa-table` : `${newModule}/关系图/fa-wpforms`;
                                    if (tempShow === tab.key) {
                                        tempShow = newKey;
                                    }
                                    return {
                                        ...tab,
                                        title: type === 'entity' ? `${newModule}&${table}` : `${newModule}/关系图`,
                                        key: newKey,
                                        value: type === 'entity' ? `entity&${newModule}&${table}` : `map&${newModule}/关系图`,
                                    };
                                }
                                return tab;
                            }),
                            show: show !== tempShow ? tempShow : show,
                        })
                    });
                });
                break;
            case 'delete':
                Modal.confirm(
                    {
                        title: '删除提示',
                        message: `确定删除模块【${key[2]}】吗？删除后不可恢复！`,
                        width: 400,
                        onOk: (modal) => {
                            modal && modal.close();
                            moduleUtils.deleteModule(key[2], dataSource, (data) => {
                                saveProject(data, () => {
                                    // 关闭该模块下的所有tab;
                                    // map&qqq/关系图/fa-snowflake-o
                                    // module&table/fa-table
                                    // this._tabClose(`${module}&${table}/fa-table`);
                                    const {tabs = []} = this.state;
                                    const keys = tabs.filter(tab => {
                                        if (tab.key === `${key[2]}/关系图/fa-snowflake-o`) {
                                            return true;
                                        } else if (tab.key.startsWith(`${key[2]}&`)) {
                                            return true;
                                        }
                                        return false;
                                    }).map(tab => tab.key);
                                    this._tabClose(keys);
                                });
                            })
                        }
                    });
                break;
            case 'copy':
                moduleUtils.copyModule(key[2], dataSource);
                break;
            case 'cut':
                moduleUtils.cutModule(key[2], dataSource);
                break;
            case 'paste':
                moduleUtils.pasteModule(dataSource, (data) => {
                    saveProject(data);
                });
                break;
            default:
                break;
        }
    };
    _onDrop = (drop, drag) => {
        // database&data&MySQL
        // datatype&data&DateTime
        const dropType = drop.split('&')[0];
        const dragType = drag.split('&')[0];
        if (dropType !== dragType) {
            Modal.error({title: '移动失败', message: '数据类型和数据库之间数据不可移动', width: 300})
        } else {
            const dropKey = drop.split('&')[2];
            const dragKey = drag.split('&')[2];
            const {dataSource, project, saveProject} = this.props;
            const datatype = _object.get(dataSource, `dataTypeDomains.${dropType}`, []);
            const dropIndex = datatype.findIndex(type => type.code === dropKey);
            const dragIndex = datatype.findIndex(type => type.code === dragKey);
            saveProject({
                ...dataSource,
                dataTypeDomains: {
                    ...dataSource.dataTypeDomains || {},
                    [dropType]: moveArrayPosition(datatype, dragIndex, dropIndex)
                }
            })
        }
    };
    _onDataTableDrop = (drop, drag) => {
        if (drag.split('&')[0] === 'module') {
            const dragModule = drag.split('&')[1];
            if (drop.split('&')[0] !== 'module') {
                Modal.error({title: '移动失败', message: '模块不能与非模块之间移动'})
            } else {
                const dropModule = drop.split('&')[1];
                const {saveProject, dataSource, project} = this.props;
                const dragIndex = (dataSource.modules || []).findIndex(mo => mo.name === dragModule);
                const dropIndex = (dataSource.modules || []).findIndex(mo => mo.name === dropModule);
                saveProject({
                    ...dataSource,
                    modules: moveArrayPosition(dataSource.modules || [], dragIndex, dropIndex),
                });
            }
        } else {
            // entity&测试模块&Emplyee
            const dropKeys = drop.split('&');
            const dragKeys = drag.split('&');
            const dropModule = dropKeys[1];
            const dragModule = dragKeys[1];
            const dropEntity = dropKeys[2];
            const dragEntity = dragKeys[2];
            // map&原型链/关系图 module&原型链 table&原型链&数据表 entity&原型链&test
            if (!dropEntity || !dragEntity) {
                let message = '无法移动非数据表！';
                if (!dropEntity) {
                    message = '无法移动至非数据表！'
                }
                Modal.error({title: '移动失败', message: message, width: 200});
            } else if (dropModule !== dragModule && dropModule && dragModule) {
                /*Modal.confirm({
                  title: '确定移动吗',
                  message: '改变数据表的模块会删除当前模块中的关联关系，你确定要这样吗！',
                  width: 500,
                  onOk: () => {
        // Modal.error({title: '移动失败', message: '无法跨模块移动数据表！', width: 200});
                    // 跨模块移动操作
                    // 当前模块删除
                  },
                  onCancel: () => {
                  }
                });*/
                const {saveProject, dataSource, project} = this.props;
                // 获取将要移动的数据表
                const dragModuleData = (dataSource.modules || []).filter(module => module.name === dragModule)[0];
                const dragEntityData = (dragModuleData.entities || []).filter(entity => entity.title === dragEntity)[0];
                // 更新关系图中的节点信息
                // 1.获取所有的关系图节点界面
                Object.keys(this.relationInstance).forEach((r) => {
                    // 2.循环更新所有的节点
                    // 如果移动的表已经在该关系图中则将模块名置为空
                    const relationModuleName = r.split('/')[0];
                    if (relationModuleName === dragModule) {
                        // 移动的模块
                        // 获取所有的节点
                        if (this.relationInstance[r]) {
                            const nodes = this.relationInstance[r].getNodes();
                            // 设置新的节点
                            this.relationInstance[r].setNodes(nodes.map((n) => {
                                if (n.title.split(':')[0] === dragEntity) {
                                    return {
                                        ...n,
                                        moduleName: dropModule,
                                    }
                                }
                                return n;
                            }));
                        }
                    } else if (relationModuleName === dropModule) {
                        // 放置的模块
                        // 获取所有的节点
                        if (this.relationInstance[r]) {
                            const nodes = this.relationInstance[r].getNodes();
                            // 设置新的节点
                            this.relationInstance[r].setNodes(nodes.map((n) => {
                                if (n.title.split(':')[0] === dragEntity) {
                                    return {
                                        ...n,
                                        moduleName: false,
                                    }
                                }
                                return n;
                            }));
                        }
                    }
                });
                saveProject({
                    ...dataSource,
                    modules: (dataSource.modules || []).map((module) => {
                        if (module.name === dragModule) {
                            const tempEntities = [...(module.entities || [])];
                            const dragIndex = tempEntities.findIndex(entity => entity.title === dragEntity);
                            tempEntities.splice(dragIndex, 1);
                            let graphCanvas = _object.get(module, 'graphCanvas', undefined);
                            if (graphCanvas) {
                                // 判断该模块的关系图中是否有此表
                                graphCanvas = {
                                    ...graphCanvas,
                                    nodes: (graphCanvas.nodes || []).map((n) => {
                                        if (n.title.split(':')[0] === dragEntity) {
                                            return {
                                                ...n,
                                                moduleName: dropModule,
                                            }
                                        }
                                        return n;
                                    })
                                }
                            }
                            return {
                                ...module,
                                entities: tempEntities,
                                graphCanvas,
                            };
                        } else if (module.name === dropModule) {
                            const tempEntities = [...(module.entities || [])];
                            const dropIndex = tempEntities.findIndex(entity => entity.title === dropEntity);
                            tempEntities.splice(dropIndex, 0, dragEntityData);
                            let graphCanvas = _object.get(module, 'graphCanvas', undefined);
                            if (graphCanvas) {
                                // 判断该模块的关系图中是否有此表
                                graphCanvas = {
                                    ...graphCanvas,
                                    nodes: (graphCanvas.nodes || []).map((n) => {
                                        if (n.title.split(':')[0] === dragEntity) {
                                            return {
                                                ...n,
                                                moduleName: false,
                                            }
                                        }
                                        return n;
                                    })
                                }
                            }
                            return {
                                ...module,
                                entities: tempEntities,
                                graphCanvas
                            }
                        }
                        return module;
                    })
                }, () => {
                    this._updateTabs(dragModule, dragEntity, dragEntity, dropModule);
                });
                // 放置的模块新增
            } else {
                // 交换数据表的位置
                const {saveProject, dataSource, project} = this.props;
                saveProject({
                    ...dataSource,
                    modules: (dataSource.modules || []).map((module) => {
                        if (module.name === dragModule) {
                            const entities = module.entities;
                            const dragIndex = entities.findIndex(entity => entity.title === dragEntity);
                            const dropIndex = entities.findIndex(entity => entity.title === dropEntity);
                            return {
                                ...module,
                                entities: moveArrayPosition(entities, dragIndex, dropIndex),
                            };
                        }
                        return module;
                    })
                });
            }
        }
    };
    _getTableNameByNameTemplate = (entity) => {
        const nameTemplate = entity.nameTemplate || '{code}[{name}]';
        if (!nameTemplate) {
            return entity.chnname || entity.title;
        } else {
            return nameTemplate.replace(/\{(\w+)\}/g, (match, key) => {
                let tempKey = key;
                if (tempKey === 'code') {
                    tempKey = 'title';
                } else if (tempKey === 'name') {
                    tempKey = 'chnname';
                }
                return entity[tempKey];
            }) || entity.title;
        }
    };
    _onMouseDown = (event) => {
        this.moveUp = false;
        const downX = event.clientX;
        this.leftTabInstanceDom = ReactDom.findDOMNode(this.leftTabInstance);
        this.instanceDom = ReactDom.findDOMNode(this.instance);
        const react = this.leftTabInstanceDom.getBoundingClientRect();
        const offWidth = parseFloat(react.width) || 0;
        document.onmousemove = (e) => {
            if (!this.moveUp) {
                this.leftTabInstanceDom.style.width = `${offWidth - (downX - e.clientX)}px`;
                this.instanceDom.style.width = `calc(100% - ${offWidth - (downX - e.clientX)}px)`;
                if (this.treeInstance) {
                    // 更新树的搜索框的宽度
                    this.treeInstance.updateSearchWidth(offWidth - (downX - e.clientX));
                }
            } else {
                document.onmousemove = null;
            }
        };
        document.onmouseup = () => {
            this.moveUp = true;
        };
    };
    _onZoom = (zoom) => {
        const {show} = this.state;
        this.relationInstance[show] && this.relationInstance[show].onZoom(zoom);
    };
    _relationSearch = (e) => {
        const {show} = this.state;
        this.relationInstance[show] && this.relationInstance[show].searchNodes(e.target.value);
    };
    _exportImage = () => {
        openModal(<ExportImg/>, {
            title: '选择图片导出类型',
            onOk: (modal, com) => {
                modal.close();
                const type = com.getType();
                const {show} = this.state;
                this.relationInstance[show] && this.relationInstance[show].exportImg(type);
            }
        });
    };

    render() {
        const {
            dataSource, project, saveProject, changeDataType,
            dataHistory, saveProjectSome, columnOrder, configJSON, updateConfig
        } = this.props;
        const {tools, tab, width, toolsClickable, show, clicked, tabs = [], versions} = this.state;

        const projectInfo = (
            <div></div>
        );


        const versionInfo = (
            <DatabaseVersion
                project={project}
                dataSource={dataSource}
                configJSON={configJSON}
                saveProject={saveProject}
                updateConfig={updateConfig}
                versions={versions}
                dbVersion='v0.0.0'
            />
        );

        const importInfo = (
            <Menu>
                <Menu.Item key="1" icon={<MyIcon type="icon-line-height"/>} onClick={() => this._readDB()}>
                    数据库逆向解析
                </Menu.Item>
                <Menu.Item key="2" icon={<MyIcon type="icon-PDM"/>} onClick={() => this._readPDMfile()}>
                    解析PDM文件
                </Menu.Item>
                <Menu.Item key="3" icon={<MyIcon type="icon-other_win"/>} onClick={() => this._readPDMfile()}>
                    解析ERWin文件
                </Menu.Item>
            </Menu>
        );

        const saveInfo = (
            <Menu>
                <Menu.Item key="1" icon={<SaveOutlined/>} onClick={() => this._saveAll()}>
                    保存
                </Menu.Item>
                <Menu.Item key="2" icon={<Icon type='fa-save' style={{marginRight: 5, color: '#9291CD'}}/>}
                           onClick={() => this._saveAs()}>
                    另存为
                </Menu.Item>
            </Menu>
        );


        const exportInfo = (
            <Menu>
                <Menu.Item key="1" icon={<MyIcon type="icon-f-export"/>} onClick={() => this._export()}>
                    导出文档
                </Menu.Item>
                <Menu.Item key="2" icon={<MyIcon type="icon-DDL"/>} onClick={() => this._exportSQL()}>
                    导出DDL
                </Menu.Item>
                <Menu.Item key="3" icon={<MyIcon type="icon-JSON"/>} onClick={() => this._saveAs()}>
                    导出JSON
                </Menu.Item>
            </Menu>
        );

        return (
            <div>
                <Context
                    menus={this.state.contextMenus}
                    left={this.state.left}
                    top={this.state.top}
                    display={this.state.contextDisplay}
                    closeContextMenu={this._closeContextMenu}
                    onClick={this._contextClick}
                />
                <Row style={{padding: "10px"}}>
                    <Col span={6}>
                        <Space split={<Divider type="vertical"/>}>
                            <Link to="/project"><ArrowLeftOutlined title={"返回"} title={"返回"}/></Link>
                            <SwaggerButton type="text" overlay={projectInfo} text={this.props.project} title={"项目信息"}>
                            </SwaggerButton>
                            <SwaggerButton type="text" overlay={versionInfo} text={this.state.dbVersion} title={"版本"}
                                           onClick={() => this._menuClick('plug')}>
                            </SwaggerButton>
                            <SwaggerButton type="text" overlay={importInfo} text={"解析"}>
                            </SwaggerButton>
                        </Space>
                    </Col>
                    <Col span={18} align="right">
                        <Space split={<Divider type="vertical"/>}>
                            <Button shape="circle" title={"数据源"} onClick={() => this._JDBCConfig()}>
                                <ThunderboltTwoTone title={"数据源"}/>
                            </Button>
                            <Button shape="circle" title={"配置默认数据"} onClick={() => this._setting()}>
                                <SettingTwoTone title={"配置默认数据"}/>
                            </Button>
                            <Button shape="circle" title={"保存(CTRL+S)"} onClick={() => this._saveAll()}>
                                <SaveTwoTone title={"保存(CTRL+S)"}/>
                            </Button>
                            <SwaggerButton type="text" overlay={exportInfo} text={"导出"}>
                            </SwaggerButton>
                        </Space>
                    </Col>
                </Row>

                <div className="erd-wrapper">

                    <div className="tools-work-content" style={{display: tools === 'dbversion' ? 'none' : ''}}>
                        <div
                            className="tools-left-tab"
                            style={{
                                width: width === 0 ? 20 : '20%',
                                minWidth: width === 0 ? 20 : 200,
                                background: '#ffffff'
                            }}
                            ref={instance => this.leftTabInstance = instance}
                        >
                            <div className="tools-left-tab-header">
                                <div className="tools-left-tab-header-icons">
                                    <Icon title='收起左侧树图' type="verticleright" onClick={this._closeLeftTab}/>
                                    <Icon title='重新加载项目' type="reload1" onClick={this._refresh}
                                          style={{display: width === 0 ? 'none' : ''}}/>
                                </div>
                                <div className="tools-left-tab-header-tab-names"
                                     style={{display: width === 0 ? 'none' : ''}}>
                <span
                    className={`${tab === 'table' ? 'menu-tab-tools-edit-active' : ''}`}
                    onClick={() => this._leftTabChange('table')}
                >
                    <Icon type='fa-th' style={{marginRight: 5}}/>数据表
                </span>
                                    <span
                                        className={`${tab === 'domain' ? 'menu-tab-tools-edit-active' : ''}`}
                                        onClick={() => this._leftTabChange('domain')}
                                    ><Icon type='fa-th-list' style={{marginRight: 5}}/>数据域</span>
                                </div>
                            </div>
                            <div className="tools-left-tab-body" style={{display: width === 0 ? 'none' : ''}}>
                                <div className="tools-left-tab-body-table"
                                     style={{display: tab === 'table' ? '' : 'none'}}>
                                    {
                                        (dataSource.modules || []).length > 0 ? <Tree
                                            showSearch
                                            ref={instance => this.treeInstance = instance}
                                            onContextMenu={this._onContextMenu}
                                            onDoubleClick={this._onDoubleClick}
                                            onDrop={this._onDataTableDrop}
                                        >
                                            {
                                                (dataSource.modules || []).map((module) => {
                                                    const realName = module.chnname ? `${module.name}-${module.chnname}` : module.name;
                                                    return (<TreeNode
                                                        draggable
                                                        key={module.name}
                                                        realName={realName}
                                                        name={realName}
                                                        value={`module&${module.name}`}>
                                                        <TreeNode
                                                            name={<span><Icon
                                                                type='fa-wpforms'
                                                                style={{marginRight: 2, color: '#50B011'}}
                                                            />关系图</span>}
                                                            value={`map&${module.name}/关系图`}/>
                                                        <TreeNode
                                                            name='数据表'
                                                            value={`table&${module.name}&数据表`}
                                                        >
                                                            {(module.entities || [])
                                                                .map((entity) => {
                                                                    const realName = this._getTableNameByNameTemplate(entity);
                                                                    return (
                                                                        <TreeNode
                                                                            realName={realName}
                                                                            key={entity.title}
                                                                            name={<span>
                                    <Icon
                                        type='fa-table'
                                        style={{marginRight: 2, color: '#1B8CDC'}}
                                    />{realName}</span>}
                                                                            value={`entity&${module.name}&${entity.title}`}/>
                                                                    )
                                                                })}
                                                        </TreeNode>
                                                    </TreeNode>);
                                                })
                                            }
                                        </Tree> : <span onClick={this._emptyClick}
                                                        className='tools-left-tab-body-domain-empty-span'>
                    <Icon type='addfolder'/>无模块点击新增</span>
                                    }
                                </div>
                                <div className="tools-left-tab-body-domain"
                                     style={{display: tab === 'domain' ? '' : 'none'}}>
                                    <Tree onContextMenu={this._onContextMenu} onDoubleClick={this._onDoubleClick}
                                          onDrop={this._onDrop}>
                                        {
                                            ([{name: '数据类型', type: 'datatype'}, {
                                                name: '数据库',
                                                type: 'database'
                                            }]).map((type) => {
                                                return (<TreeNode key={type.name} name={type.name}
                                                                  value={`${type.type}&${type.name}`}>
                                                    {
                                                        (dataSource.dataTypeDomains &&
                                                            dataSource.dataTypeDomains[type.type] || [])
                                                            .map(data => (
                                                                <TreeNode
                                                                    key={data.code || data.name}
                                                                    realName={`${data.name || data.code}${data.defaultDatabase ? '(默认)' : ''}`}
                                                                    name={<span>
                                <Icon
                                    type={type.type === 'datatype' ? 'fa-viacoin' : 'fa-database'}
                                    style={{marginRight: 2, color: type.type === 'datatype' ? '#3BB359' : '#E17729'}}
                                />{`${data.name || data.code}${data.defaultDatabase ? '(默认)' : ''}`}</span>
                                                                    }
                                                                    value={`${type.type}&data&${data.code || data.name}`}/>))
                                                    }
                                                </TreeNode>);
                                            })
                                        }
                                    </Tree>
                                </div>
                            </div>
                        </div>
                        <div className="tools-left-border" onMouseDown={this._onMouseDown}>{}</div>
                        <div
                            className="tools-right-paint"
                            ref={instance => this.instance = instance}
                            style={{
                                width: width === 0 ? 'calc(100% - 20px)' : '80%',
                                minWidth: 200,
                                background: "#ffffff"
                            }}
                        >
                            {
                                tabs.filter(lefttab => !lefttab.folding).length === 0 ?
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            width: '100%',
                                            height: '100%',
                                            paddingTop: 50,
                                            userSelect: 'none',
                                        }}>
                                        双击左侧树图开始工作吧
                                    </div>
                                    : <Tab
                                        dataSource={this.props.dataSource}
                                        leftTabWidth={this.state.leftTabWidth}
                                        onClose={this._tabClose}
                                        onClick={this._tabHeaderClick}
                                        show={this.state.show}
                                        tabs={tabs}
                                    >
                                        {tabs.filter(lefttab => !lefttab.folding).map((leftTab) => {
                                            return (<TabPane
                                                realName={this._getTabRealName(leftTab.title)}
                                                icon={leftTab.icon}
                                                title={leftTab.title.replace('&', '/')}
                                                key={leftTab.key}
                                            >{React.cloneElement(leftTab.com, {
                                                id: leftTab.key,
                                                value: leftTab.value,
                                                changeDataType: changeDataType,
                                                updateTabs: this._updateTabs,
                                                ref: instance => {
                                                    if (leftTab.value.startsWith('entity&')) {
                                                        this.tableInstance[leftTab.key] = instance
                                                    } else {
                                                        this.relationInstance[leftTab.key] = instance
                                                    }
                                                },
                                                dataSource,
                                                project,
                                                saveProject,
                                                show,
                                                dataHistory,
                                                saveProjectSome,
                                                columnOrder,
                                                versions,
                                                modeChange: this._changeMode,
                                                openTab: this._onDoubleClick,
                                            })}</TabPane>);
                                        })}
                                    </Tab>
                            }
                        </div>
                    </div>
                    {
                        tools === 'dbversion' ?
                            <DatabaseVersion
                                project={project}
                                dataSource={dataSource}
                                configJSON={configJSON}
                                saveProject={saveProject}
                                updateConfig={updateConfig}
                                versions={versions}
                                dbVersion='v0.0.0'
                            /> : ''
                    }
                </div>
            </div>
        );
    }
}
