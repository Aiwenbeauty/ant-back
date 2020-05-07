import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import {
  Row,
  Card,
  Table,
  Modal,
  Select,
  message,
  Form,
  Input,
  Button,
  TreeSelect,
  Radio,
} from 'antd';
import PropTypes from 'prop-types';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ menu }) => ({
  menu,
}))
@Form.create()
class CreateForm extends PureComponent {
  static defaultProps = {
    handleAdd: () => { },
    handleAddModalVisible: () => { },
    menu: {
      allmenus: [],
      total: 20,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      isApi: false,
      menuType: 'button',
    };
  }

  onSelect = () => {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (fieldsValue.resourceType === 'button') {
        this.setState({
          menuType: fieldsValue.resourceType,
        });
      }
    });
  };

  render() {
    const { form, handleAddModalVisible, handleAdd, modalVisible, menu, isPageAuth } = this.props;
    const { menuType, isApi } = this.state;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        handleAdd(fieldsValue, form);
      });
    };
    const allmenus = menu.allmenus ? menu.allmenus : [];
    const filterData = array => {
      return array.filter(item => {
        return item.resourceType === 'menu';
      });
    };

    // 新建菜单->选择父级菜单时的数据->格式化
    const formateData = data => {
      if (Array.isArray(data)) {
        return filterData(data).map(item => {
          return item.childData
            ? {
              title: item.name,
              value: item.id,
              key: item.id,
              children: formateData(item.childData),
            }
            : {
              title: item.name,
              value: item.id,
              key: item.id,
            };
        });
      }
      return [];
    };
    // 新建按钮级权限->选择页面时的数据->格式化
    const formatePageData = data => {
      if (Array.isArray(data)) {
        return data.map(item => {
          return {
            title: item.name,
            value: item.id,
            key: item.id,
            children: item.resourceType === 'button' ? null : formatePageData(item.childData),
            selectable: item.resourceType === 'button',
          };
        });
      }
      return [];
    };
    const treeData = allmenus.length === 0 ? [] : formateData(allmenus);
    const pageData = allmenus.length === 0 ? [] : formatePageData(allmenus);
    treeData.unshift({
      title: '无',
      value: 0,
      key: 0,
    });

    // 新建菜单需要填的表单
    const menuForm = !isPageAuth && (
      <Form>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单名">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入菜单名！' }],
          })(<Input placeholder="用于菜单栏中名称显示" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限编码">
          {form.getFieldDecorator('code', {
            rules: [{ required: true, message: '请输入权限编码！' }],
          })(<Input placeholder="前端代码根据编码判断按钮显示隐藏" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单URL">
          {form.getFieldDecorator('href', {
            rules: [{ required: true, message: '请输入菜单URL！' }],
          })(<Input placeholder="应与router.config.js中path路径一致" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="父级菜单">
          {form.getFieldDecorator('parentId', {
            rules: [{ required: true, message: '请选择父级菜单！' }],
          })(
            <TreeSelect
              style={{ width: 300 }}
              // value={this.state.value}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={treeData}
              placeholder="请选择"
              treeDefaultExpandAll
            />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类型">
          {form.getFieldDecorator('resourceType', {
            rules: [{ required: true, message: '请输入类型！' }],
          })(
            <Select style={{ width: 120 }} onChange={this.onSelect} placeholder="请选择">
              <Option value="menu">父级菜单</Option>
              <Option value="button">页面</Option>
            </Select>
          )}
        </FormItem>
        {menuType === 'button' && (
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单栏">
            {form.getFieldDecorator('isShow',{
              rules: [{ required: true, message: '请选择！' }],
            })(
              <Radio.Group>
                <Radio value={1}>显示</Radio>
                <Radio value={0}>隐藏</Radio>
              </Radio.Group>
            )}
          </FormItem>
        )}
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
          {form.getFieldDecorator('remark', {})(<TextArea placeholder="请输入" />)}
        </FormItem>
      </Form>
    );

    // 新建按钮级权限需要填的表单
    const pageAuthForm = isPageAuth && (
      <Form>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限名">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入权限名！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限范围">
          {form.getFieldDecorator('isApi', {
            initialValue: 0,
            rules: [{ required: true, message: '请选择权限范围！' }],
          })(
            <Radio.Group
              onChange={e => {
                this.setState({
                  isApi: e.target.value === 1,
                });
              }}
            >
              <Radio value={0}>页面</Radio>
              <Radio value={1}>页面 + 接口</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限编码">
          {form.getFieldDecorator('code', {
            rules: [{ required: true, message: '请输入权限编码！' }],
          })(<Input placeholder="前端代码根据编码判断按钮显示隐藏" />)}
        </FormItem>
        {isApi && (
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="接口路径">
            {form.getFieldDecorator('apiUrl', {
              rules: [{ required: true, message: '请输入接口路径！' }],
            })(<Input placeholder="如：/empty-item/sysUser/editPassword" />)}
          </FormItem>
        )}
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="所属页面">
          {form.getFieldDecorator('parentId', {
            rules: [{ required: true, message: '请选择页面！' }],
          })(
            <TreeSelect
              style={{ width: 300 }}
              // value={this.state.value}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={pageData}
              placeholder="请选择"
              treeDefaultExpandAll
            />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类型">
          {form.getFieldDecorator('resourceType', {
            initialValue: 'pageAuth',
            rules: [{ required: true, message: '请选择类型！' }],
          })(
            <Select style={{ width: 120 }} onChange={this.onSelect} disabled>
              <Option value="pageAuth">pageAuth</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
          {form.getFieldDecorator('remark', {})(<TextArea placeholder="请输入" />)}
        </FormItem>
      </Form>
    );
    return (
      <Modal
        maskClosable={false}
        destroyOnClose
        title={!isPageAuth ? '新建菜单' : '新建按钮级权限'}
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleAddModalVisible()}
        okText="确定"
        cancelText="取消"
        confirmLoading={menu.loading}
      >
        {!isPageAuth ? menuForm : pageAuthForm}
      </Modal>
    );
  }
}
@connect(({ menu }) => ({
  menu,
}))
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => { },
    handleUpdateModalVisible: () => { },
    currentRecord: {},
  };

  render() {
    const {
      updateModalVisible,
      handleUpdateModalVisible,
      handleUpdate,
      form,
      currentRecord,
      isPageAuth,
      menu,
    } = this.props;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        form.resetFields();
        if (currentRecord.id) {
          handleUpdate(fieldsValue, currentRecord.id);
        }
      });
    };
    const allmenus = menu.allmenus ? menu.allmenus : [];
    const filterData = array => {
      return array.filter(item => {
        return item.resourceType === 'menu' && item.id !== currentRecord.id;
      });
    };

    // 新建菜单->选择父级菜单时的数据->格式化
    const formateData = data => {
      if (Array.isArray(data)) {
        return filterData(data).map(item => {
          return item.childData
            ? {
              title: item.name,
              value: item.id,
              key: item.id,
              children: formateData(item.childData),
            }
            : {
              title: item.name,
              value: item.id,
              key: item.id,
            };
        });
      }
      return [];
    };

    const treeData = allmenus.length === 0 ? [] : formateData(allmenus);
    treeData.unshift({
      title: '无',
      value: 0,
      key: 0,
    });

    // 编辑菜单需要填的表单
    const menuForm = !isPageAuth && (
      <Form>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单名">
          {form.getFieldDecorator('name', {
            initialValue: currentRecord.name,
            rules: [{ required: true, message: '请输入菜单名！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限编码">
          {form.getFieldDecorator('code', {
            initialValue: currentRecord.code,
            rules: [{ required: true, message: '请输入权限编码！' }],
          })(<Input placeholder="请输入" disabled />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单URL">
          {form.getFieldDecorator('href', {
            initialValue: currentRecord.href,
            rules: [{ required: true, message: '请输入菜单URL！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="父级菜单">
          {form.getFieldDecorator('parentId', {
            initialValue: currentRecord.parentId,
            rules: [{ required: true, message: '请选择父级菜单！' }],
          })(
            <TreeSelect
              style={{ width: 300 }}
              // value={this.state.value}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={treeData}
              placeholder="请选择"
              treeDefaultExpandAll
            />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类型">
          {form.getFieldDecorator('resourceType', {
            initialValue: currentRecord.resourceType,
            rules: [{ required: true, message: '请输入类型！' }],
          })(
            <Select style={{ width: 120 }} onChange={this.onSelect} placeholder="请选择">
              <Option value="menu">父级菜单</Option>
              <Option value="button">页面</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单栏">
          {form.getFieldDecorator('isShow', {
            initialValue: Number(!currentRecord.hideInMenu),
            rules: [{ required: true, message: '请选择' }],
          })(
            <Radio.Group>
              <Radio value={0}>隐藏</Radio>
              <Radio value={1}>显示</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
          {form.getFieldDecorator('remark', {
            initialValue: currentRecord.remark,
          })(<TextArea placeholder="请输入" />)}
        </FormItem>
      </Form>
    );

    // 编辑按钮级权限需要填的表单
    const pageAuthForm = isPageAuth && (
      <Form>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限名">
          {form.getFieldDecorator('name', {
            initialValue: currentRecord.name,
            rules: [{ required: true, message: '请输入权限名！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限编码">
          {form.getFieldDecorator('code', {
            initialValue: currentRecord.code,
            rules: [{ required: true, message: '请输入权限编码！' }],
          })(<Input placeholder="请输入" disabled />)}
        </FormItem>
        {currentRecord.apiUrl && (
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="接口路径">
            {form.getFieldDecorator('apiUrl', {
              initialValue: currentRecord.apiUrl,
              rules: [{ required: true, message: '请输入接口路径！' }],
            })(<Input placeholder="如：/empty-item/sysUser/editPassword" />)}
          </FormItem>
        )}
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
          {form.getFieldDecorator('remark', {
            initialValue: currentRecord.remark,
          })(<Input placeholder="请输入" />)}
        </FormItem>
      </Form>
    );

    return (
      <Modal
        maskClosable={false}
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={!isPageAuth ? '编辑菜单' : '编辑按钮级权限'}
        visible={updateModalVisible}
        onOk={okHandle}
        onCancel={() => handleUpdateModalVisible(false)}
        afterClose={() => handleUpdateModalVisible()}
        okText="确定"
        cancelText="取消"
        confirmLoading={menu.loading}
      >
        {!isPageAuth ? menuForm : pageAuthForm}
      </Modal>
    );
  }
}

@Form.create()
/* eslint react/no-multi-comp:0 */
@connect(({ menu }) => ({
  menu,
}))
class MenuControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updateModalVisible: false,
      addmodalVisible: false,
      currentRecord: null,
      isPageAuth: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/fetch',
      payload: {},
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'menu/fetch',
      payload: {
        pageNo: 1,
      },
    });
  };

  renderCell = (text, width) => (
    <div
      style={{
        width: `${width}`,
        overflow: 'hidden',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {text}
    </div>
  );

  handleUpdateModalVisible = (flag, record, isPageAuth) => {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'menu/fetchAll',
      });
    }
    this.setState({
      isPageAuth,
      updateModalVisible: !!flag,
      currentRecord: record,
    });
  };

  handleAddModalVisible = (flag, isPageAuth) => {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'menu/fetchAll',
      });
    }
    this.setState({
      isPageAuth,
      addmodalVisible: !!flag,
    });
  };

  handleFormateData = data => {
    return data.map(item => {
      return Array.isArray(item.childData)
        ? {
          ...item,
          children: this.handleFormateData(item.childData),
        }
        : item;
    });
  };

  handleAdd = (fields, form) => {
    const { dispatch } = this.props;
    // add permission
    fields.permission = fields.code;
    dispatch({
      type: 'menu/add',
      payload: fields,
    }).then(res => {
      if (res.code === 'SUCCESS') {
        form.resetFields();
        this.handleAddModalVisible();
      }
    });
  };

  handleUpdate = (fields, id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/update',
      payload: {
        ...fields,
        id,
      },
    });
    this.handleUpdateModalVisible();
  };

  handleDeleteConfirm = record => {
    Modal.confirm({
      title: '确定删除该菜单？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.handleDelete(record);
      },
    });
  };

  handleDelete = record => {
    const { dispatch } = this.props;
    const { id, children } = record;
    if (children) {
      setTimeout(() => message.warning('请先删除子菜单！'), 500);
    } else {
      const ids = [id];
      dispatch({
        type: 'menu/remove',
        payload: ids,
      });
    }
  };

  render() {
    const { menu } = this.props;
    const { updateModalVisible, addmodalVisible, currentRecord, isPageAuth } = this.state;
    const addMethods = {
      handleAdd: this.handleAdd,
      handleAddModalVisible: this.handleAddModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: 200,
        render: text => <span style={{ whiteSpace: 'noWrap' }}>{text}</span>,
      },
      {
        title: '路径',
        dataIndex: 'href',
        render: text => <span style={{ whiteSpace: 'noWrap' }}>{text}</span>,
      },
      {
        title: '权限编码',
        dataIndex: 'code',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
      {
        title: '类型',
        dataIndex: 'resourceType',
        render(item) {
          switch (item) {
            case 'menu':
              return '菜单';
            case 'button':
              return '页面';
            case 'pageAuth':
              return '按钮';
            default:
              return '菜单';
          }
        },
      },
      {
        title: '操作',
        render: (text, record) => {
          return (
            <p style={{ whiteSpace: 'noWrap' }}>
              <a
                onClick={() => {
                  if (record.resourceType === 'pageAuth') {
                    this.handleUpdateModalVisible(true, record, true);
                  } else {
                    this.handleUpdateModalVisible(true, record, false);
                  }
                }}
              >
                编辑
              </a>
              &nbsp;&nbsp;
              <a onClick={() => this.handleDeleteConfirm(record)}>删除</a>
            </p>
          );
        },
      },
    ];
    const dataSource = Array.isArray(menu.rows) ? this.handleFormateData(menu.rows) : menu.rows;

    return (
      <PageHeaderWrapper title="菜单管理">
        <Card>
          {/* 参数1:显示隐藏，参数2:isPageAuth */}
          <Button
            icon="plus"
            type="primary"
            onClick={() => this.handleAddModalVisible(true, false)}
          >
            菜单
          </Button>
          <Button
            icon="plus"
            type="default"
            onClick={() => this.handleAddModalVisible(true, true)}
            style={{ marginLeft: 20 }}
          >
            按钮级权限
          </Button>
          <Row style={{ marginTop: 20 }}>
            <Table
              className={styles.menuTable}
              dataSource={dataSource}
              rowKey="id"
              rowClassName="textCenter"
              columns={columns}
              loading={menu.loading}
              bordered={false}
              scroll={{ x: 'max-content' }}
            />
          </Row>
          <CreateForm {...addMethods} modalVisible={addmodalVisible} isPageAuth={isPageAuth} />
          {currentRecord && Object.keys(currentRecord).length ? (
            <UpdateForm
              {...updateMethods}
              currentRecord={currentRecord}
              updateModalVisible={updateModalVisible}
              isPageAuth={isPageAuth}
            />
          ) : null}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

MenuControl.propTypes = {
  menu: PropTypes.object,
};

MenuControl.defaultProps = {
  menu: {
    rows: [],
    totalPage: 5,
    totalCount: 10,
  },
};

export default MenuControl;
