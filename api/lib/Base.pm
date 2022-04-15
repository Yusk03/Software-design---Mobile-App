package Abills::Base;

=head1 NAME

Abills::Base - Base functions

=head1 SYNOPSIS

    use Abills::Base;

    convert();

=cut

no if $] >= 5.017011, warnings => 'experimental::smartmatch';
use feature 'state';
use strict;
our (%EXPORT_TAGS);

use POSIX qw(locale_h strftime mktime);
use parent 'Exporter';
use utf8;

our $VERSION = 2.00;

our @EXPORT = qw(
  json_former
  escape_for_sql
  camelize
  decamelize
);

our @EXPORT_OK = qw(
  json_former
  escape_for_sql
  camelize
  decamelize
);

#**********************************************************
=head2 json_former($request) - hash2json

  Arguments
    $request (strinf|arr|hash)
    $attr
      ESCAPE_DQ           - escape double quotes
      USE_CAMELIZE        - camelize keys of hash
      CONTROL_CHARACTERS  - escape \t and \n

  Result
    JSON_string

=cut
#**********************************************************
sub json_former {
  my ($request, $attr) = @_;
  my @text_arr = ();

  #TODO: if data is string, but contains only digits, it's returned as numbers

  if (ref $request eq 'ARRAY') {
    foreach my $key (@{$request}) {
      push @text_arr, json_former($key, $attr);
    }
    return '[' . join(', ', @text_arr) . ']';
  }
  elsif (ref $request eq 'HASH') {
    foreach my $key (sort keys %{$request}) {
      my $val = json_former($request->{$key}, $attr);

      if ($attr->{USE_CAMELIZE}) {
        my $new_key = camelize($key);
        $request->{$new_key} = $request->{$key};
        $key = $new_key;
      }

      $attr->{ESCAPE_DQ} ? push @text_arr, qq{\\"$key\\":$val} :
        push @text_arr, qq{\"$key\":$val};
    }
    return '{' . join(', ', @text_arr) . '}';
  }
  else {
    $request //= '';
    $request =~ s/"/\\"/gm;
    if ($attr->{CONTROL_CHARACTERS}){
      $request =~ s/[\t]/\\t/g;
      $request =~ s/[\n]/\\n/g;
    }

    $request =~ s/[\x{00}-\x{1f}]+//ig;

    if ($request =~ '^([0])' && $request =~'^\w{2,}$') {
      $attr->{ESCAPE_DQ} ? return qq{\\"$request\\"} :
        return qq{\"$request\"};
    }
    elsif (!$request && !($request =~ '[0]')){
      $attr->{ESCAPE_DQ} ? return qq{\\"$request\\"} :
        return qq{\"$request\"};
    }
    elsif ($request =~ '^-?\d*\.?\d+$') {
      return qq{$request};
    }
    else {
      $attr->{ESCAPE_DQ} ? return qq{\\"$request\\"} :
        return qq{\"$request\"};
    }
  }
}

#***********************************************************
=head2 escape_from_sql($input) - escapes data so it will be safe to put it to DB functions

  Same escaping is done in Abills::HTML::form_parse.
  This function is meant to be used when Abills::HTML::form_parse is not applied.

  Arguments:
    $input - data to be escaped. if it's hashref or arrayref, it's values will be recursively escaped.
             may contain nested hashrefs/arrayrefs

  Return:
    $result - escaped data

=cut
#***********************************************************
sub escape_for_sql {
  my ($input, $processed_refs) = @_;

  if (ref $input ne '') { #prevent infinite recursion when there are circular references
    if ($processed_refs->{int($input)}) {
      return $input;
    }
    $processed_refs->{int($input)} = 1;
  }

  if (ref $input eq '') {
    $input =~ s/\\/\\\\/g;
    $input =~ s/\"/\\\"/g;
    $input =~ s/\'/\\\'/g;
  }
  elsif (ref $input eq 'ARRAY') {
    foreach my $val (@$input) {
      $val = escape_for_sql($val, $processed_refs);
    }
  }
  elsif (ref $input eq 'HASH') {
    #TODO: escape hash keys?
    foreach my $key (keys %$input) {
      $input->{$key} = escape_for_sql($input->{$key}, $processed_refs);
    }
  }
  else {
    undef $input;
  }

  return $input;
}

#**********************************************************
=head2 camelize($string)

  Arguments:
     $string - make snake_case string to camelCase

   Return:
     $camel_string
=cut
#**********************************************************
sub camelize {
  my ($string) = @_;

  $string =~ s{(\w+)}{
    ($a = lc $1) =~ s<(^[a-z]|_[a-z])><
      ($b = uc $1) =~ s/^_//;
      $b;
    >eg;
    $a;
  }eg;

  return lcfirst($string);
}

#**********************************************************
=head2 decamelize($string)

  Arguments:
     $string - make camelCase string to snake_case

   Return:
     $snake_case
=cut
#**********************************************************
sub decamelize {
  my ($string) = @_;

  if ($string eq uc($string)) {
    return $string;
  }

  $string = ucfirst($string);

  $string =~ s{(\w+)}{
    ($a = $1) =~ s<(^[A-Z]|(?![a-z])[A-Z])><
      "_" . lc $1
    >eg;
    substr $a, 1;
  }eg;

  return uc($string);
}

1;
