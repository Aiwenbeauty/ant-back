import React, { Component, Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Icon, Button, Dropdown, Menu, Modal, Tree, message } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const FormItem = Form.Item;
const { TreeNode } = Tree;

@connect(({ menu, role }) => ({
  menu,
  role
}))
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/fetchAll',
    });
  }

  handleCheck = (checkedKeys, e) => {
    this.setState({
      checkedKeys: checkedKeys.checked.map(item => Number(item)),
    });
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.childData) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.childData)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.id} dataRef={item} />;
    });
  };

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible, menu, role: { loading } } = this.props;
    const { checkedKeys } = this.state;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        if (checkedKeys.length === 0) {
          message.error('请选择可访问页面');
          return;
        }
        const addValue = {
          ...fieldsValue,
          menuIds: checkedKeys
        };
        handleAdd(addValue, form);
      });
    };
    const allmenus = Array.isArray(menu.allmenus) ? menu.allmenus : [];

    return (
      <Modal
        maskClosable={false}
        destroyOnClose
        width={840}
        title="新建角色"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
        okText="确定"
        cancelText="取消"
        confirmLoading={loading}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名">
          {form.getFieldDecorator('description', {
            rules: [{ required: true, message: '请输入描述！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限">
          {form.getFieldDecorator('role', {
            rules: [{ required: true, message: '请输入权限！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="可访问页面">
          {form.getFieldDecorator('menuIds', {
            // rules: [{ required: true, message: '请选择！' }],
          })(
            <Tree
              checkedKeys={checkedKeys}
              onCheck={this.handleCheck}
              checkable
              checkStrictly
            >
              {this.renderTreeNodes(allmenus)}
            </Tree>
          )}
        </FormItem>
      </Modal>
    );
  }
}
@connect(({ menu,role }) => ({
  menu,
  role
}))
@Form.create()
class UpdateForm extends Component {
  static defaultProps = {
    handleUpdate: () => { },
    handleUpdateModalVisible: () => { },
    values: {},
    record: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: [],
    };
  }

  componentDidMount() {
    const { record } = this.props;
    this.setState({
      checkedKeys: record.menuId.split(',')
    })
  }

  handleCheck = (checkedKeys, e) => {
    this.setState({
      checkedKeys: checkedKeys.checked.map(item => Number(item)),
    });
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.childData) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.childData)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.id} dataRef={item} />;
    });
  };



  render() {
    const {
      updateModalVisible,
      handleUpdateModalVisible,
      handleUpdate,
      values,
      form,
      record,
      menu,
      role: { loading }
    } = this.props;
    const { checkedKeys } = this.state;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        if (checkedKeys.length === 0) {
          message.error('请选择可访问页面');
          return;
        }
        form.resetFields();
        const updateValue = {
          ...fieldsValue,
          menuIds: checkedKeys
        };

        if (record.id) {
          handleUpdate(updateValue, record.id);
        }
      });
    };

    const allmenus = Array.isArray(menu.allmenus) ? menu.allmenus : [];
    return (
      <Modal
        maskClosable={false}
        width={840}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="编辑角色"
        visible={updateModalVisible}
        onOk={okHandle}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
        okText="确定"
        cancelText="取消"
        confirmLoading={loading}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名">
          {form.getFieldDecorator('description', {
            initialValue: record.description,
            rules: [{ required: true, message: '请输入描述！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限">
          {form.getFieldDecorator('role', {
            initialValue: record.role,
            rules: [{ required: true, message: '请输入权限！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="可访问页面">
          {form.getFieldDecorator('menuIds', {
            // rules: [{ required: true, message: '请选择！' }],
          })(
            <Tree
              checkable
              checkedKeys={checkedKeys}
              onCheck={this.handleCheck}
              checkStrictly
            >
              {this.renderTreeNodes(allmenus)}
            </Tree>
          )}
        </FormItem>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ role, menu }) => ({
  role,
  menu,
}))
@Form.create()
class AuthorityControl extends Component {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    formValues: {},
    record: {},
  };

  static defaultProps = {
    role: {
      list: [],
    },
  };

  columns = [
    {
      title: '角色名',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/fetch',
    });
  }

  handleStandardTableChange = (pagination, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'role/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'role/fetch',
      payload: {},
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    const selectedRowKeys = selectedRows.map(item => {
      return item.id;
    });
    switch (e.key) {
      case 'remove':
        Modal.confirm({
          title:'确定删除吗？',
          onOk:()=>{
            dispatch({
              type: 'role/remove',
              payload: selectedRowKeys,
              callback: () => {
                this.setState({
                  selectedRows: [],
                });
              },
            });
          },
          okText:'确定',
          cancelText:'取消'
        });
        
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {

    this.setState({
      updateModalVisible: !!flag,
      record: record || {},
    });
  };

  handleAdd = (fields, form) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/add',
      payload: {
        description: fields.description,
        role: fields.role,
        menuIds: fields.menuIds,
      },
    }).then(res => {
      if (res.code === 'SUCCESS') {
        form.resetFields();
        this.handleModalVisible();
      }
    });
  };

  handleUpdate = (fields, id) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'role/update',
      payload: {
        description: fields.description,
        role: fields.role,
        menuIds: fields.menuIds,
        id,
      },
    });
    this.handleUpdateModalVisible();
  };

  render() {
    const { role } = this.props;
    const roleList = role.list;
    const { selectedRows, modalVisible, updateModalVisible, record } = this.state;
    const menuNode = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
      </Menu>
    );

    const addMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <PageHeaderWrapper title="角色管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <Dropdown overlay={menuNode}>
                  <Button>
                    更多操作 <Icon type="down" />
                  </Button>
                </Dropdown>
              )}
            </div>
            <StandardTable
              rowKey="id"
              rowClassName="textCenter"
              selectedRows={selectedRows}
              loading={role.loading}
              data={roleList}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm
          {...addMethods}
          modalVisible={modalVisible}
          roleList={roleList}
          values={record}
        />
        {record && Object.keys(record).length ? (
          <UpdateForm
            {...updateMethods}
            record={record}
            updateModalVisible={updateModalVisible}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default AuthorityControl;
