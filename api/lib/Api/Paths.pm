package Abills::Api::Paths;

use strict;
use warnings FATAL => 'all';

use Abills::Base qw(in_array);

#**********************************************************
=head2 new($db, $conf, $admin, $lang)

=cut
#**********************************************************
sub new {
  my ($class, $db, $conf, $admin, $lang) = @_;

  my $self = {
    db      => $db,
    admin   => $admin,
    conf    => $conf,
    lang    => $lang,
  };

  bless($self, $class);

  return $self;
}

#**********************************************************
=head2 load_own_resource_info($attr)

  Arguments:
    $attr
      package       - package
      modules       - list of modules

  Returns:
    List of routes
=cut
#**********************************************************
sub load_own_resource_info {
  my $self = shift;
  my ($attr) = @_;

  $attr->{package} = ucfirst($attr->{package} || q{});
  if (!in_array($attr->{package}, $attr->{modules})) {
    return 0;
  }

  $attr->{package} .= '::Api';
  eval "use $attr->{package}";
  if ($@ || !$attr->{package}->can('new')) {
    return 0;
  }
  else {
    my $module_obj = $attr->{package}->new($self->{db}, $self->{conf}, $self->{admin}, $self->{lang}, $attr->{debug}, $attr->{type});
    return $module_obj->{routes_list};
  }
}

#**********************************************************
=head2 list() - Returns available API paths

  Returns:
    {
      $resource_1_name => [ # $resource_1_name, $resource_2_name - names of API resources. always equals to first path segment
        {
          method  => 'GET',          # HTTP method. Path can be queried only with this method

          path    => '/users/:uid/', # API path. May contain variables like ':uid'.
                                     # these variables will be passed to handler function as argument ($path_params).
                                     # variables are always numerical.
                                     # example: if route's path is '/users/:uid/', and queried URL
                                     # is '/users/9/', $path_params will be { uid => 9 }.
                                     # if credentials is 'USER', variable :uid will be checked to contain only
                                     # authorized user's UID.

          handler => sub {           # handler function, coderef. Arguments that are passed to handler:
            my (
                $path_params,        # params from path. look at docs of path. hashref.
                $query_params,       # params from query. for details look at Abills::Api::Router::new(). hashref.
                                     # keys will be converted from camelCase to UPPER_SNAKE_CASE
                                     # using Abills::Base::decamelize unless no_decamelize_params is set
                $module_obj          # object of needed DB module (in this example - Users). used to run it's methods.
                                     # may be empty if name of module is not set.
               ) = @_;

            $module_obj->info(       # handler should return hashref or arrayref with needed data
              $path_params->{uid}
            );                       # in this example we call Users->info, and it's result are implicitly returned
          },

          module  => 'Users',        # name of DB module. it's object will be created and passed to handler as $module_obj. optional.

          type    => 'HASH',         # type of returned data. may be 'HASH' or 'ARRAY'. by default (if not set) it is 'HASH'. optional.

          credentials => [           # arrayref of roles required to use this path. if API user is authorized as at least one of
                                     # these roles access to this path will be granted. optional.
            'ADMIN'                  # may be 'ADMIN' or 'USER'
          ],

          no_decamelize_params => 0, # if set, $query_params for handler will not be converted to UPPER_SNAKE_CASE. optional.

          conf_params => [ ... ]     # variables from $conf to be returned in result. arrayref.
                                     # experimental feature, currently disabled
        },
        ...
      ],
      $resource_2_name => [
        ...
      ],
      ...
    }

=cut
#**********************************************************
sub list {
  my $self = shift;
  #TODO: for each path, add list of $query_params that may be passed from API client to function
  #TODO: check how it works with groups, multidoms
  #TODO: on some routes it returns array [..., ...] when it found data, and empty object {} when not found. example: '/user/:uid/msgs/:id/reply/'
  return {
    users     => [
      {
        method      => 'GET',
        path        => '/users/all/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          my @allowed_params = (
            'FIO',
            'FIO2',
            'FIO3',
            'DEPOSIT',
            'EXT_DEPOSIT',
            'EXT_BILL_ID',
            'CREDIT',
            'CREDIT_DATE',
            'LOGIN_STATUS',
            'PHONE',
            'EMAIL',
            'FLOOR',
            'ENTRANCE',
            'ADDRESS_FLAT',
            'PASPORT_DATE',
            'PASPORT_NUM',
            'PASPORT_GRANT',
            'CITY',
            'ZIP',
            'GID',
            'COMPANY_ID',
            'COMPANY_NAME',
            'CONTRACT_ID',
            'CONTRACT_SUFIX',
            'CONTRACT_DATE',
            'EXPIRE',
            'REDUCTION',
            'LAST_PAYMENT',
            'LAST_FEES',
            'REGISTRATION',
            'REDUCTION_DATE',
            'COMMENTS',
            'BILL_ID',
            'ACTIVATE',
            'ACCEPT_RULES',
            'PASSWORD',
            'BIRTH_DATE',
            'TAX_NUMBER'
          );
          my %PARAMS = ();
          foreach my $param (@allowed_params) {
            next if (!defined($query_params->{$param}));
            $PARAMS{$param} = '_SHOW';
          }

          $PARAMS{PAGE_ROWS}  = defined($query_params->{PAGE_ROWS}) ? $query_params->{PAGE_ROWS} : 100000;
          $PARAMS{SORT}       = defined($query_params->{SORT}) ? $query_params->{SORT} : 1;

          $module_obj->list({
            %PARAMS,
            COLS_NAME => 1,
          });
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->info($path_params->{uid});
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'PUT',
        path        => '/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->change($path_params->{uid}, {
            %$query_params
          });
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'DELETE',
        path        => '/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->del({
            %$query_params,
            UID => $path_params->{uid}
          });
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/:uid/pi/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->pi({ UID => $path_params->{uid}});
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/users/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->add({
            %$query_params
          });
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/users/:uid/pi/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->pi_add({
            %$query_params,
            UID => $path_params->{uid}
          });
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'PUT',
        path        => '/users/:uid/pi/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->pi_change({
            %$query_params,
            UID => $path_params->{uid}
          });
        },
        module      => 'Users',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/:uid/abon/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_tariff_list($path_params->{uid}, {
            COLS_NAME => 1
          });
        },
        module      => 'Abon',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/users/:uid/internet/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_add({
            %$query_params,
            UID => $path_params->{uid}
          });
        },
        module      => 'Internet',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/internet/all/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          my @allowed_params = (
            'CID',
            'CPE_MAC',
            'VLAN',
            'SERVER_VLAN',
            'JOIN_SERVICE',
            'SIMULTANEONSLY',
            'SPEED',
            'NAS_ID',
            'PORT',
            'ALL_FILTER_ID',
            'FILTER_ID',
            'TP_ID',
            'TP_NUM',
            'TP_NAME',
            'MONTH_FEE',
            'ABON_DISTRIBUTION',
            'DAY_FEE',
            'PERSONAL_TP',
            'PAYMENT_TYPE',
            'UID',
            'ID',
            'DISABLE',
            'IPN_ACTIVATE',
            'DAY_TRAF_LIMIT',
            'WEEK_TRAF_LIMIT',
            'TOTAL_TRAF_LIMIT',
            'FEES_METHOD',
            'NAS_IP',
            'FIO',
            'FIO2',
            'FIO3',
            'DEPOSIT',
            'EXT_DEPOSIT',
            'EXT_BILL_ID',
            'CREDIT',
            'CREDIT_DATE',
            'LOGIN_STATUS',
            'PHONE',
            'EMAIL',
            'FLOOR',
            'ENTRANCE',
            'ADDRESS_FLAT',
            'PASPORT_DATE',
            'PASPORT_NUM',
            'PASPORT_GRANT',
            'CITY',
            'ZIP',
            'GID',
            'COMPANY_ID',
            'COMPANY_NAME',
            'CONTRACT_ID',
            'CONTRACT_SUFIX',
            'CONTRACT_DATE',
            'EXPIRE',
            'REDUCTION',
            'LAST_PAYMENT',
            'LAST_FEES',
            'REGISTRATION',
            'REDUCTION_DATE',
            'COMMENTS',
            'BILL_ID',
            'ACTIVATE',
            'EXPIRE',
            'ACCEPT_RULES',
            'PASSWORD',
            'BIRTH_DATE',
            'TAX_NUMBER'
          );
          my %PARAMS = (
            PAGE_ROWS => (defined($query_params->{PAGE_ROWS}) ? $query_params->{PAGE_ROWS} : 100000),
            SORT      => (defined($query_params->{SORT}) ? $query_params->{SORT} : 1)
          );

          foreach my $param (@allowed_params) {
            next if (!defined($query_params->{$param}));
            $PARAMS{$param} = '_SHOW';
          }

          $module_obj->user_list({
            %PARAMS,
            COLS_NAME => 1,
          });
        },
        module      => 'Internet',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/:uid/internet/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_list({
            %$query_params,
            UID             => $path_params->{uid},
            CID             => '_SHOW',
            INTERNET_STATUS => '_SHOW',
            TP_NAME         => '_SHOW',
            MONTH_FEE       => '_SHOW',
            DAY_FEE         => '_SHOW',
            TP_ID           => '_SHOW',
            COLS_NAME       => 1
          });
        },
        module      => 'Internet',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/:uid/internet/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_info($path_params->{uid}, {
            %$query_params,
            ID        => $path_params->{id},
            COLS_NAME => 1
          });
        },
        module      => 'Internet',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/users/contacts/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->contacts_list({
            %$query_params,
            UID => '_SHOW'
          });
        },
        module      => 'Contacts',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/:uid/contacts/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->contacts_list({
            UID       => $path_params->{uid},
            VALUE     => '_SHOW',
            PRIORITY  => '_SHOW',
            TYPE      => '_SHOW',
            TYPE_NAME => '_SHOW',
          });
        },
        module      => 'Contacts',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/users/:uid/contacts/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->contacts_add({
            %$query_params,
            UID => $path_params->{uid},
          });
        },
        module      => 'Contacts',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'DELETE',
        path        => '/users/:uid/contacts/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->contacts_del({
            ID  => $path_params->{id},
            UID => $path_params->{uid}
          });
        },
        module      => 'Contacts',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'PUT',
        path        => '/users/:uid/contacts/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->contacts_change({
            %$query_params,
            ID  => $path_params->{id},
            UID => $path_params->{uid}
          });
        },
        module      => 'Contacts',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/users/:uid/iptv/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_list({
            %$query_params,
            UID          => $path_params->{uid},
            SERVICE_ID   => '_SHOW',
            TP_FILTER    => '_SHOW',
            MONTH_FEE    => '_SHOW',
            DAY_FEE      => '_SHOW',
            TP_NAME      => '_SHOW',
            SUBSCRIBE_ID => '_SHOW',
            COLS_NAME    => 1
          });
        },
        module      => 'Iptv',
        credentials => [
          'ADMIN'
        ]
      },
      {
        #TODO: :uid is not used
        method      => 'GET',
        path        => '/users/:uid/iptv/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_info($path_params->{id}, {
            %$query_params,
            COLS_NAME => 1
          });
        },
        module      => 'Iptv',
        credentials => [
          'ADMIN'
        ]
      },
      # {
      #   method => 'POST',
      #   path   => '/users/login/',
      #   handler              => sub {
      #     my ($path_params, $query_params, $module_obj) = @_;
      #
      #     my ($uid, $sid, $login) = auth_user($query_params->{login}, $query_params->{password}, '');
      #
      #     return {
      #       UID   => $uid,
      #       SID   => $sid,
      #       LOGIN => $login
      #     }
      #   },
      #   no_decamelize_params => 1
      # }
    ],
    admins    => [
      {
        method      => 'POST',
        path        => '/admins/:aid/contacts/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->admin_contacts_add({
            %$query_params,
            AID     => $path_params->{aid},
          });
        },
        module      => 'Admins',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'PUT',
        path        => '/admins/:aid/contacts/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->admin_contacts_change({
            %$query_params,
            AID     => $path_params->{aid}
          });
        },
        module      => 'Admins',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/admins/:aid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->info($path_params->{aid}, {
            %$query_params
          });
        },
        module      => 'Admins',
        credentials => [
          'ADMIN'
        ]
      }
    ],
    tp        => [
      {
        method      => 'GET',
        path        => '/tp/:tpID/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->info(undef, {
            %$query_params,
            TP_ID => $path_params->{tpID}
          });
        },
        module      => 'Tariffs',
        credentials => [
          'ADMIN'
        ]
      },
      { #TODO: do we need this? we already have path '/intervals/:tpID/'
        method      => 'GET',
        path        => '/tp/:tpID/intervals/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->ti_list({
            TP_ID => $path_params->{tpID},
            COLS_NAME => 1
          });
        },
        module      => 'Tariffs',
        credentials => [
          'ADMIN'
        ]
      }
    ],
    abon      => [
      {
        method      => 'GET',
        path        => '/abon/tariffs/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->tariff_list({
            %$query_params,
            COLS_NAME => 1
          });
        },
        module      => 'Abon',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/abon/tariffs/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->tariff_add({
            %$query_params
          });
        },
        module      => 'Abon',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/abon/tariffs/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->tariff_info($path_params->{id});
        },
        module      => 'Abon',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/abon/tariffs/:id/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_tariff_change({
            %$query_params,
            IDS => $path_params->{id},
            UID => $path_params->{uid}
          });
        },
        module      => 'Abon',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'DELETE',
        path        => '/abon/tariffs/:id/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_tariff_change({
            DEL => $path_params->{id},
            UID => $path_params->{uid}
          });
        },
        module      => 'Abon',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/abon/users/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_list({
            %$query_params,
            COLS_NAME => 1
          });
        },
        module      => 'Abon',
        credentials => [
          'ADMIN'
        ]
      }
    ],
    intervals => [
      {
        method      => 'GET',
        path        => '/intervals/:tpID/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->ti_info($path_params->{tpID});
        },
        module      => 'Tariffs',
        credentials => [
          'ADMIN'
        ]
      }
    ],
    groups    => [
      {
        method      => 'GET',
        path        => '/groups/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->groups_list({
            NAME           => '_SHOW',
            DOMAIN_ID      => '_SHOW',
            DESCR          => '_SHOW',
            DISABLE_CHG_TP => '_SHOW',
            COLS_NAME      => 1
          });
        },
        module      => 'Users',
        type        => 'ARRAY',
        credentials => [
          'ADMIN'
        ]
      }
    ],
    #TODO DELETE IT IF USELESS
    # pages     => [
    #   {
    #   #TODO: is it even working?
    #   method               => 'GET',
    #   path                 => '/pages/index/',
    #   handler              => sub {
    #     my ($path_params, $query_params) = @_;
    #
    #     return { INDEX => get_function_index($query_params->{name}) }
    #   },
    #   no_decamelize_params => 1
    #   };
    # ],
    version   => [],
    currency  => [],
    builds    => [
      {
        method      => 'GET',
        path        => '/builds/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->build_list({
            %$query_params,
            COLS_NAME => 1,
            DISTRICT_NAME => '_SHOW',
            STREET_NAME   => '_SHOW'
          });
        },
        module      => 'Address',
        type        => 'ARRAY',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/builds/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->build_info({
            %$query_params,
            COLS_NAME => 1,
            ID        => $path_params->{id}
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/builds/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->build_add({
            %$query_params
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'PUT',
        path        => '/builds/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->build_change({
            %$query_params,
            ID => $path_params->{id},
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
    ],
    streets   => [
      {
        method      => 'GET',
        path        => '/streets/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->street_list({
            %$query_params,
            COLS_NAME   => 1,
            STREET_NAME => '_SHOW',
            BUILD_COUNT => '_SHOW',
            DISTRICT_ID => '_SHOW'
          });
        },
        module      => 'Address',
        type        => 'ARRAY',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/streets/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->street_info({
            %$query_params,
            COLS_NAME => 1,
            ID        => $path_params->{id}
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/streets/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->street_add({
            %$query_params
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'PUT',
        path        => '/streets/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->street_change({
            %$query_params,
            ID => $path_params->{id}
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
    ],
    districts => [
      {
        method      => 'GET',
        path        => '/districts/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->district_list({
            %$query_params,
            COLS_NAME => 1,
          });
        },
        module      => 'Address',
        type        => 'ARRAY',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/districts/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->district_add({
            %$query_params
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/districts/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->district_info({
            %$query_params,
            COLS_NAME => 1,
            ID        => $path_params->{id}
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'PUT',
        path        => '/districts/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->district_change({
            %$query_params,
            ID => $path_params->{id}
          });
        },
        module      => 'Address',
        credentials => [
          'ADMIN'
        ]
      },
    ],
    online    => [
      {
        method      => 'GET',
        path        => '/online/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->online({
            UID             => $path_params->{uid},
            CLIENT_IP_NUM   => '_SHOW',
            NAS_ID          => '_SHOW',
            USER_NAME       => '_SHOW',
            CLIENT_IP       => '_SHOW',
            DURATION        => '_SHOW',
            STATUS          => '_SHOW'
          });
        },
        module      => 'Internet::Sessions',
        type        => 'ARRAY',
        credentials => [
          'ADMIN'
        ]
      },
    ],
    payments  => [
      {
        method      => 'GET',
        path        => '/payments/types/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->payment_type_list({
            %$query_params,
            COLS_NAME => 1
          });
        },
        module      => 'Payments',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/payments/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->list({
            %$query_params,
            UID       => $path_params->{uid},
            DESC      => 'DESC',
            SUM       => '_SHOW',
            REG_DATE  => '_SHOW',
            METHOD    => '_SHOW',
            COLS_NAME => 1
          });
        },
        module      => 'Payments',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'POST',
        path        => '/payments/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->add({ UID => $path_params->{uid} }, {
            %$query_params,
            UID => $path_params->{uid},
          });
        },
        module      => 'Payments',
        credentials => [
          'ADMIN'
        ]
      }
    ],
    fees      => [
      {
        method      => 'GET',
        path        => '/fees/types/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->fees_type_list({
            %$query_params,
            COLS_NAME => 1
          });
        },
        module      => 'Fees',
        credentials => [
          'ADMIN'
        ]
      },
      {
        method      => 'GET',
        path        => '/fees/users/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->list({
            %$query_params,
            UID       => $path_params->{uid},
            SUM       => '_SHOW',
            DESCRIBE  => '_SHOW',
            REG_DATE  => '_SHOW',
            METHOD    => '_SHOW',
            COLS_NAME => 1
          });
        },
        module      => 'Fees',
        credentials => [
          'ADMIN'
        ]
      },
      {
        #TODO: we can send uid of one user and bill_id of other user. db will be in inconsistent state. fix it.
        method      => 'POST',
        path        => '/fees/users/:uid/:sum/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->take({ UID => $path_params->{uid} }, $path_params->{sum}, {
            %$query_params,
            UID => $path_params->{uid}
          });
        },
        module      => 'Fees',
        credentials => [
          'ADMIN'
        ]
      }
    ],
    user      => [
      {
        method      => 'GET',
        path        => '/user/:uid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->info($path_params->{uid});
        },
        module      => 'Users',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/pi/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->pi({ UID => $path_params->{uid} });
        },
        module      => 'Users',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'POST',
        path        => '/user/:uid/credit/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_set_credit({
            UID           => $path_params->{uid},
            change_credit => 1
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/credit/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_set_credit({
            UID       => $path_params->{uid},
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/internet/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          my $tariffs_list = $module_obj->user_list({
            UID             => $path_params->{uid},
            CID             => '_SHOW',
            INTERNET_STATUS => '_SHOW',
            TP_NAME         => '_SHOW',
            MONTH_FEE       => '_SHOW',
            DAY_FEE         => '_SHOW',
            TP_ID           => '_SHOW',
            COLS_NAME       => 1,
            PAGE_ROWS       => 1
          });

          require Shedule;
          Shedule->import();
          my $Schedule = Shedule->new($self->{db}, $self->{admin}, $self->{conf});
          $Schedule->info({ UID => $path_params->{uid}, TYPE => 'tp', MODULE => 'Internet' });
          if (scalar(@{$tariffs_list}) && $Schedule->{TOTAL} > 0)  {
            my $action = $Schedule->{ACTION};
            my $service_id = 0;
            if ($action =~ /:/) {
              ($service_id, $action) = split(/:/, $action);
            }
            $tariffs_list->[0]->{Schedule} = {
              SHEDULE_ID => $Schedule->{SHEDULE_ID},
              DATE       => $Schedule->{DATE},
              DATE_FROM  => "$Schedule->{Y}-$Schedule->{M}-$Schedule->{D}",
              TP_ID      => $action
            };
          }

          my $speed = $module_obj->get_speed({
            UID       => $path_params->{uid},
            TP_ID     => $tariffs_list->[0]->{tp_id},
            COLS_NAME => 1,
            PAGE_ROWS => 1
          });

          $tariffs_list->[0]->{in_speed} = $speed->[0]->{in_speed};
          $tariffs_list->[0]->{out_speed} = $speed->[0]->{out_speed};

          return $tariffs_list;
        },
        module      => 'Internet',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/internet/speed/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->get_speed({
            UID             => $path_params->{uid},
            COLS_NAME       => 1,
            PAGE_ROWS       => 1
          });
        },
        module      => 'Internet',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/internet/speed/:tpid/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->get_speed({
            TP_NUM          => $path_params->{tpid},
            COLS_NAME       => 1,
            PAGE_ROWS       => 1
          });
        },
        module      => 'Internet',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/internet/:id/holdup/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_holdup({
            UID          => $path_params->{uid},
            ID           => $path_params->{id},
            ACCEPT_RULES => 1
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'POST',
        path        => '/user/:uid/internet/:id/holdup/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_holdup({
            %$query_params,
            UID          => $path_params->{uid},
            ID           => $path_params->{id},
            add          => 1,
            ACCEPT_RULES => 1
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'DELETE',
        path        => '/user/:uid/internet/:id/holdup/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_holdup({
            UID         => $path_params->{uid},
            ID          => $path_params->{id},
            del         => 1,
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/internet/tariffs/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->available_tariffs({
            SKIP_NOT_AVAILABLE_TARIFFS => 1,
            UID                        => $path_params->{uid},
            MODULE                     => 'Internet'
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/internet/tariffs/all/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->available_tariffs({
            UID    => $path_params->{uid},
            MODULE => 'Internet'
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/internet/:id/warnings/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->service_warning({
            UID    => $path_params->{uid},
            ID     => $path_params->{id},
            MODULE => 'Internet'
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'PUT',
        path        => '/user/:uid/internet/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_chg_tp({
            %$query_params,
            UID          => $path_params->{uid},
            ID           => $path_params->{id}, #ID from internet main
            MODULE       => 'Internet'
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'DELETE',
        path        => '/user/:uid/internet/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->del_user_chg_shedule({
            UID        => $path_params->{uid},
            SHEDULE_ID => $path_params->{id}
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/iptv/services/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->services_list({
            NAME        => '_SHOW',
            USER_PORTAL => '>0',
            COLS_NAME   => 1
          });
        },
        module      => 'Iptv',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/iptv/:id/tariffs/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          my $test = $module_obj->available_tariffs({
            SKIP_NOT_AVAILABLE_TARIFFS => 1,
            ID                         => $path_params->{id},
            UID                        => $path_params->{uid},
            MODULE                     => 'Iptv'
          });

          return $test;
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/iptv/:id/tariffs/all/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->available_tariffs({
            ID     => $path_params->{id},
            UID    => $path_params->{uid},
            MODULE => 'Iptv'
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/iptv/:id/warnings/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->service_warning({
            UID    => $path_params->{uid},
            ID     => $path_params->{id},
            MODULE => 'Iptv'
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'PUT',
        path        => '/user/:uid/iptv/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_chg_tp({
            %$query_params,
            UID               => $path_params->{uid},
            ID                => $path_params->{id}, #ID from iptv main
            DISABLE_CHANGE_TP => 1,
            MODULE            => 'Iptv'
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'DELETE',
        path        => '/user/:uid/iptv/:id/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->del_user_chg_shedule({
            UID        => $path_params->{uid},
            SHEDULE_ID => $path_params->{id}
          });
        },
        module      => 'Control::Service_control',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/iptv/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_list({
            UID          => $path_params->{uid},
            SERVICE_ID   => '_SHOW',
            TP_FILTER    => '_SHOW',
            MONTH_FEE    => '_SHOW',
            DAY_FEE      => '_SHOW',
            TP_NAME      => '_SHOW',
            SUBSCRIBE_ID => '_SHOW',
            CID          => '_SHOW',
            EMAIL        => '_SHOW',
            MAC_CID      => '_SHOW',
            COLS_NAME    => 1,
            PAGE_ROWS    => 1
          });
        },
        module      => 'Iptv',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/abon/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->user_tariff_list($path_params->{uid}, {
            COLS_NAME => 1
          });
        },
        module      => 'Abon',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/payments/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->list({
            UID       => $path_params->{uid},
            DSC       => '_SHOW',
            SUM       => '_SHOW',
            DATETIME  => '_SHOW',
            EXT_ID    => '_SHOW',
            PAGE_ROWS => ($query_params->{PAGE_ROWS} || 10000),
            COLS_NAME => 1
          });
        },
        module      => 'Payments',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/fees/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->list({
            UID       => $path_params->{uid},
            DSC       => '_SHOW',
            SUM       => '_SHOW',
            DATETIME  => '_SHOW',
            PAGE_ROWS => ($query_params->{PAGE_ROWS} || 10000),
            COLS_NAME => 1
          });
        },
        module      => 'Fees',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'POST',
        path        => '/user/:uid/contacts/push/subscribe/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          return {
            errstr => 'No field token in body',
            errno  => '5000'
          } if (!$query_params->{TOKEN});
          my $list = $module_obj->contacts_list({
            UID   => $path_params->{uid},
            TYPE  => 15,
            VALUE => '_SHOW'
          });

          my $Ureports = '';
          eval {require Ureports; Ureports->import()};
          if (!$@) {
            $Ureports = Ureports->new($self->{db}, $self->{conf}, $self->{admin});
          }

          if ($list && !scalar(@{$list})) {
            $module_obj->contacts_add({
              TYPE_ID => 15,
              VALUE   => $query_params->{TOKEN},
              UID     => $path_params->{uid},
            });

            if ($Ureports) {
              $Ureports->user_send_type_add({
                TYPE        => 15,
                DESTINATION => $query_params->{TOKEN},
                UID         => $path_params->{uid}
              });
            }
          }
          else {
            if ($query_params->{TOKEN} ne $list->[0]->{value}) {
              $module_obj->contacts_change({
                ID    => $list->[0]->{id},
                VALUE => $query_params->{TOKEN},
              });

              if ($Ureports) {
                $Ureports->user_send_type_del({
                  TYPE        => 15,
                  UID         => $path_params->{uid},
                });

                $Ureports->user_send_type_add({
                  DESTINATION => $query_params->{TOKEN},
                  TYPE        => 15,
                  UID         => $path_params->{uid},
                });
              }

              return 1;
            }
            else {
              return {
                errstr => 'You are already subscribed',
                errno  => '5001'
              }
            }
          }
        },
        module      => 'Contacts',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'DELETE',
        path        => '/user/:uid/contacts/push/subscribe/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          $module_obj->contacts_del({
            TYPE_ID => 15,
            UID     => $path_params->{uid},
          });

          my $Ureports = '';
          eval {require Ureports; Ureports->import()};
          if (!$@) {
            $Ureports = Ureports->new($self->{db}, $self->{conf}, $self->{admin});
          }

          if ($Ureports) {
            $Ureports->user_send_type_del({
              TYPE => 15,
              UID  => $path_params->{uid}
            });
          }

          return 1;
        },
        module      => 'Contacts',
        credentials => [
          'USER'
        ]
      },
      {
        method      => 'GET',
        path        => '/user/:uid/contacts/push/subscribe/',
        handler     => sub {
          my ($path_params, $query_params, $module_obj) = @_;

          my $list = $module_obj->contacts_list({
            UID   => $path_params->{uid},
            TYPE  => 15,
            VALUE => '_SHOW'
          });

          delete @{$list->[0]}{qw/type_id id/} if ($list->[0]);

          return $list->[0] || {};
        },
        module      => 'Contacts',
        credentials => [
          'USER'
        ]
      },
    ]
  };
}

1;
