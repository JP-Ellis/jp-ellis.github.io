#!/usr/bin/env python
# -*- coding: utf-8 -*- #

# This file is only used if you use `make publish` or explicitly specify it as
# your config file.

from __future__ import unicode_literals

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

PUBLISH = True

SITEURL = 'https://jpellis.me'
RELATIVE_URLS = False

DELETE_OUTPUT_DIRECTORY = True
OUTPUT_RETENTION = [".git", ".gitignore"]

# Services
###############################################################################
# GOOGLE_ANALYTICS = 'UA-62514224-3'
GOOGLE_TAG_MANAGER = 'GTM-M7H67J'
DISQUS_SITENAME = "jpellisgithubio"
