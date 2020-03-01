using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace demo.wsclient
{
    public partial class MainWindow : Window
    {
        #region [ properties ]
        public List<WSServiceDescriptor> Services = new List<WSServiceDescriptor>
        {
            {{#services}}
            new WSServiceDescriptor
            {
                Name = "{{serviceName}}",
                Hubs = new List<HubDescriptor>
                {
                    {{#hubEvents}}
                    new HubDescriptor { IsAuth = {{isAuth}}, Service = "{{serviceName}}", Name = "{{name}}", Credentials = "{{&defaults.credentials}}"  },
                    {{/hubEvents}}
                },
                Rests = new List<RestDescriptor>
                {
                    {{#restMethods}}
                    new RestDescriptor { IsAuth = {{isAuth}}, Service = "{{serviceName}}", Name = "{{name}}", Data="{{&defaults.data}}", Credentials = "{{&defaults.credentials}}"  },
                    {{/restMethods}}
                }
            },
            {{/services}}
        };
        #endregion

        #region [ constructor ]
        public MainWindow()
        {
            InitializeComponent();
            Loaded += (s, e) => UpdateView(Services);          
        }
        #endregion

        #region [ private ]
        private void UpdateView(List<WSServiceDescriptor> services)
        {
            _uiTab.Items.Clear();
            services.ForEach(x => _uiTab.Items.Add(new TabItem { Header = x.Name, Content = new WSServiceControl(x) }));
        }
        #endregion

        #region [ Auth ]
        private async void Button_register(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await Context.Instance.wsapi.Auth.Register(new { email = "admin@nex-group.io", password = "123456" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_Login(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await Context.Instance.wsapi.Auth.Login(new { email = "admin@nex-group.io", password = "123456" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_Logout(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await Context.Instance.wsapi.Auth.Logout();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_authenticate(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await Context.Instance. wsapi.Auth.Authenticate(Context.Instance.wsapi.Auth.AuthInfo.token);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        #endregion

        #region [ Socket ]
        private void Button_Connect(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] Connect");
                Context.Instance.wsapi.Ws.Connect("ws://localhost:3000/wsapi", "/");
            }
            catch(Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }

        private void Button_Disconnect(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] Disconnect");
                Context.Instance.wsapi.Ws.Disconnect();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private void Button_NestJS_Test(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] nestjs test");
                Context.Instance.wsapi.Ws.Emit("test");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }

        private void Button_NestJS_Test_Exception(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] nestjs test Exception");
                Context.Instance.wsapi.Ws.Emit("testException");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        #endregion     
    }
}
