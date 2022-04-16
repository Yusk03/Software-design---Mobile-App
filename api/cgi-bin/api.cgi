#!/usr/bin/perl

use strict;
use warnings;

BEGIN {
  our $libpath = '../';
  my $sql_type = 'mysql';
  unshift(@INC,
    $libpath . "Abills/$sql_type/",
    $libpath . 'Abills/modules/',
    $libpath . '/lib/',
    $libpath . '/Abills/',
    $libpath . '/Abills/Api/',
    $libpath
  );

  eval {require Time::HiRes;};
  our $begin_time = 0;
  if (!$@) {
    Time::HiRes->import(qw(gettimeofday));
    $begin_time = Time::HiRes::gettimeofday();
  }
}

use Abills::JSON;
use Abills::Defs;
use Users;
use Admins;
use Conf;
use Api;
use Abills::Api::Router;
use Abills::Api::FildsGrouper;

require Control::Auth;

our (
  %LANG,
  %lang,
  @MONTHES,
  @WEEKDAYS,
  $base_dir,
  @REGISTRATION,
  @MODULES
);

my $VERSION = 0.09;
do 'Abills/Misc.pm';
do '../libexec/config.pl';
do $libpath . '/language/english.pl';

our $db = Abills::SQL->connect($conf{dbtype}, $conf{dbhost}, $conf{dbname}, $conf{dbuser}, $conf{dbpasswd},
  { CHARSET => ($conf{dbcharset}) ? $conf{dbcharset} : undef,
    dbdebug => $conf{dbdebug}
  });

our $admin      = Admins->new($db, \%conf);
our Users $user = Users->new($db, $admin, \%conf);
our $Conf       = Conf->new($db, $admin, \%conf);

our $html = Abills::HTML->new({
  IMG_PATH   => 'img/',
  NO_PRINT   => 1,
  CONF       => \%conf,
  CHARSET    => $conf{default_charset},
  HTML_STYLE => $conf{UP_HTML_STYLE}
});

_start();

#**********************************************************
=head2 _start()

=cut
#**********************************************************
sub _start {
  my $response = q{};
  my $status = q{};

  if (!$conf{API_ENABLE}) {
    $status = 400;
    $response = Abills::Base::json_former({ errstr => 'API didn\'t enable please enable API in config $conf{API_ENABLE}=1;', errno => 301 });
  }
  else {
    #TODO : Fix %FORM add make possible to paste query params with request body
    my $router = Abills::Api::Router->new(($ENV{PATH_INFO} || q{}), $db, $user, $admin, $Conf->{conf}, \%FORM, \%lang, \@MODULES);

    if ($router->{errno}) {
      $status = 400;
      $response = Abills::Base::json_former({ errstr => $router->{errstr}, errno => $router->{errno} });
    }
    else {
      add_custom_paths($router);
      add_credentials($router);
      $router->handle();

      if ($router->{allowed}) {
        $router->transform(\&Abills::Api::FildsGrouper::group_fields);
        $router->{status} = 400 if !$router->{status} && $router->{errno};
      }
      else {
        $router->{result} = { errstr => 'Access denied', errno => 10 };
        $router->{status} = 401;
      }
      my $use_camelize = defined $ENV{HTTP_CAMELIZE} ? $ENV{HTTP_CAMELIZE} : (
        defined $conf{API_FILDS_CAMELIZE} ? $conf{API_FILDS_CAMELIZE} : 1
      );

      $response = Abills::Base::json_former($router->{result}, {USE_CAMELIZE => $use_camelize, CONTROL_CHARACTERS => 1});
      $status = $router->{status};
    }

    if ($conf{API_LOG}) {
      my $Api = Api->new($db, $admin, \%conf);
      my $response_time = Abills::Base::gen_time($begin_time);
      ($response_time) =~ s/GT: //g;

      $Api->add({
        UID           => ($router->{user}->{UID} || q{}),
        SID           => ($router->{user}->{SID} || q{}),
        AID           => ($router->{user}->{admin}->{AID} || q{}),
        REQUEST_URL   => ($ENV{REQUEST_URI} || q{}),
        REQUEST_BODY  => $FORM{__BUFFER},
        RESPONSE_TIME => $response_time,
        RESPONSE      => $response,
        IP            => $ENV{REMOTE_ADDR},
        HTTP_STATUS   => ($status || 200),
        HTTP_METHOD   => $ENV{REQUEST_METHOD}
      });
    }
  }

  print Abills::JSON::header(undef, { STATUS => $status || '' });
  print $response;
  return 1;
}

#**********************************************************
=head2 add_custom_paths()

=cut
#**********************************************************
sub add_custom_paths {
  my ($router) = @_;

  $router->add_custom_handler('users', {
    method               => 'POST',
    path                 => '/users/login/',
    handler              => sub {
      my ($path_params, $query_params) = @_;

      my ($uid, $sid, $login) = auth_user($query_params->{login}, $query_params->{password}, '');

      return {
        UID   => $uid,
        SID   => $sid,
        LOGIN => $login
      }
    },
    no_decamelize_params => 1
  });

  $router->add_custom_handler('currency', {
    method  => 'GET',
    path    => '/currency/',
    handler => sub {
      return {
        system_currency => $conf{SYSTEM_CURRENCY}
      };
    },
  });

  $router->add_custom_handler('version', {
    method      => 'GET',
    path    => '/version/',
    handler => sub {
      return {
        version     => get_version(),
        billing     => 'ABillS',
        api_version => $VERSION
      };
    },
  });

  return 1;
}

#**********************************************************
=head2 add_credentials()

=cut
#**********************************************************
sub add_credentials {
  my ($router) = @_;

  $router->add_credential('ADMIN', sub {
    my $self = shift;
    my $API_KEY = $ENV{HTTP_KEY};

    return check_permissions('', '', '', { API_KEY => $API_KEY }) == 0;
  });

  $router->add_credential('USER', sub {
    #TODO check how does it work when user have G2FA
    my $self = shift;
    my $SID = $ENV{HTTP_USERSID};
    my ($uid) = auth_user('', '', $SID); #TODO check

    $uid = $self->{path_params}{uid} ne $uid ? 0 : $uid if $self->{path_params}{uid};
    return $uid != 0;
  });

  return 1;
}

1;
