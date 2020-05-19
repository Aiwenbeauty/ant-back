import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import Link from 'umi/link';
import { Checkbox, Alert, Icon, Input, message } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

// 短信登录已废弃
@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  state = {
    type: 'account',
    captchaImg: ``,
    captcha: '',
  };

  componentDidMount() {
    this.changeCode();

  }

  onTabChange = type => {
    this.setState({ type });
  };

  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      this.loginForm.validateFields(['phone'], {}, (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;
          const payload = {
            phone: values.phone,
            vfCodeType: 'ADMIN_LOGIN',
          };
          dispatch({
            type: 'login/getCaptcha',
            payload,
          })
            .then(res => {
              if (res.code == 'SUCCESS') {
                resolve();
              }
            })
            .catch(reject);
        }
      });
    });

  handleSubmit = (err, values) => {
    const { type, captcha } = this.state;
    if (!captcha && type === 'account') {
      message.error('请输入验证码');
      return;
    }
    if (!err) {
      const { dispatch } = this.props;
      // 1是账号登陆,0是短信登陆
      // 短信登录已废弃，忽略
      const loginType = type === 'account' ? 1 : 0;
      type === 'mobile' ? (values.loginName = values.phone) : '';
      const data =
        type === 'account'
          ? {
            ...values,
            verifyCode: captcha,
            loginType,
          }
          : {
            ...values,
            loginType,
          };
      dispatch({
        type: 'login/login',
        payload: data,
      }).then(res => {
        if (res.code !== 'SUCCESS') {
          // 刷新验证码
          this.changeCode();
        }
      });
    }
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  changeCode = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/getCaptcha',
    }).then((res)=>{
      if(res.code === 'SUCCESS'){
        this.setState({
          captchaImg:res.data,
        });
      }
    
    });
    
  };

  handleCaptchaChange = e => {
    this.setState({
      captcha: e.target.value,
    });
  };

  render() {
    const { submitting } = this.props;
    const { type, captchaImg, captcha } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          {/* <Tab key="account" tab={formatMessage({ id: 'app.login.tab-login-credentials' })}>
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage(formatMessage({ id: 'app.login.message-invalid-credentials' }))} */}
          <UserName
            name="loginName"
            placeholder="用户名：user"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'validation.userName.required' }),
              },
            ]}
          />
          <Password
            name="password"
            placeholder="密码：123456"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'validation.password.required' }),
              },
            ]}
            onPressEnter={e => {
              e.preventDefault();
              this.loginForm.validateFields(this.handleSubmit);
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input
              name="verifyCode"
              placeholder="验证码:"
              style={{ width: 150, height: 40 }}
              value={captcha}
              onChange={e => this.handleCaptchaChange(e)}
            />
            <div style={{ height: 40 }} dangerouslySetInnerHTML={{__html:captchaImg}} onClick={() => this.changeCode()} />
            
          </div>
          {/* </Tab> */}
          {/* <Tab key="mobile" tab={formatMessage({ id: 'app.login.tab-login-mobile' })}>
            {login.status === 'error' &&
              login.type === 'mobile' &&
              !submitting &&
              this.renderMessage(
                formatMessage({ id: 'app.login.message-invalid-verification-code' })
              )}
            <Mobile
              name="phone"
              placeholder={formatMessage({ id: 'form.phone-number.placeholder' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.phone-number.required' }),
                },
                {
                  pattern: /^1\d{10}$/,
                  message: formatMessage({ id: 'validation.phone-number.wrong-format' }),
                },
              ]}
            />
            <Captcha
              name="vfCode"
              placeholder={formatMessage({ id: 'form.verification-code.placeholder' })}
              countDown={60}
              onGetCaptcha={this.onGetCaptcha}
              getCaptchaButtonText={formatMessage({ id: 'form.get-captcha' })}
              getCaptchaSecondText={formatMessage({ id: 'form.captcha.second' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.verification-code.required' }),
                },
              ]}
            />
          </Tab> */}
          <div>
            {/* <a style={{ float: 'right' }} href="/user/forgotpwd">
              <FormattedMessage id="app.login.forgot-password" />
            </a> */}
          </div>
          <Submit loading={submitting}>
            <FormattedMessage id="app.login.login" />
          </Submit>
          {/* <div className={styles.other}>
            <FormattedMessage id="app.login.sign-in-with" />
            <Icon type="alipay-circle" className={styles.icon} theme="outlined" />
            <Icon type="taobao-circle" className={styles.icon} theme="outlined" />
            <Icon type="weibo-circle" className={styles.icon} theme="outlined" />
            <Link className={styles.register} to="/user/register">
              <FormattedMessage id="app.login.signup" />
            </Link>
          </div> */}
        </Login>
      </div>
    );
  }
}

export default LoginPage;
