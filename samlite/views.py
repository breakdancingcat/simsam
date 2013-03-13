from django.template import RequestContext, loader
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth import authenticate, login, logout
from django.utils import simplejson as json

import random

from samlite.models import Animation
from samlite.models import AnimationFrame
from home.models import Sprite
from home.models import SimsamUser, Project

#debugging

import pprint

from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login 

#@login_required
def index(request):
    # check if logged in and get projects list
    # use template to display projects
    simsamuser = None
    projects = []
    animation = None
    simulation = None
    project = None
    framesequence = []
    spritecollection = []
    image_hash = ""
    projectOpen = False
    chooseProject = False
    openingProject = False
    if request.user.is_authenticated():
	user = request.user
        if hasattr(user, '_wrapped') and hasattr(user, '_setup'):
		if user._wrapped.__class__ == object:
			user._setup()
		user = user._wrapped
        simsamuser = SimsamUser.objects.filter(user=user)[0]
        projects = Project.objects.filter(owner=simsamuser)
    animations = Animation.objects.all()
    t = loader.get_template("samlite.html")
    c = RequestContext(request, {"project": project, "animation": animation, "projectOpen": projectOpen, "image_hash": image_hash, "projectList": projects, "chooseProject": chooseProject, "frame_sequence": framesequence, "sprite_collection": spritecollection, "openingProject": openingProject, "simulation": simulation, "simsamuser": simsamuser})
    return HttpResponse(t.render(c))
    
def save_image(request, digit):
    openingProject = False
    image_string = request.POST[u"image_string"]
    image_type = request.POST[u"image_type"]
    animation_id = request.POST.get(u'animation_id', default=None)
    if image_type == 'AnimationFrame':
        image_class = AnimationFrame
    elif image_type == 'Sprite':
        image_class = Sprite
    else:
        return HttpResponse(json.dumps({
            'success': False, 
            'message': "Invalid image type: %s." % image_type
        }))

    image_obj = image_class();
    image_obj.set_image_string(image_string)
    image_obj.save()

    # add the image hash to the animation frame sequence
    try:
        animation = Animation.objects.get(id=animation_id)
    except Animation.DoesNotExist:
        success = False
        message = "Invalid animation_id: %s." % animation_id
    else:
        success = True
        message = ''
        if image_type == 'AnimationFrame':
		animation.frame_sequence = animation.frame_sequence + ", " + image_obj.image_hash
		animation.save()
	else:
	   	animation.sprite_collection = animation.sprite_collection + ", " + image_obj.image_hash
		animation.save()
	animation.save()
		
    return HttpResponse(json.dumps({
        'success': True,
        'id': image_obj.image_hash
    }))

def save_frame_sequence(request):
    animation_id = request.POST.get(u'animation_id', default=None)
    frame_sequence = [int(x) for x in request.POST.getlist(u'frame_sequence[]')]
    try:
        animation = Animation.objects.get(id=animation_id)
    except Animation.DoesNotExist:
        success = False
        message = "Invalid animation_id: %s." % animation_id
    else:
        success = True
        message = ''
        animation.frame_sequence = frame_sequence
        animation.save()

    return HttpResponse(json.dumps({'success': success, 'message': message}))

#process user login
def login_user(request):
    state = "Please log in below..."
    username = password = ''
    if request.POST:
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                state = "You're successfully logged in!"
                return HttpResponseRedirect('/samlite')
            else:
                state = "Your account is not active, please contact the site admin."
    return HttpResponseRedirect('/samlite')

    #return render_to_response('samlite.html', {'state':state, 'username': username})

def logout_user(request, digit):
    logout(request)
    return HttpResponseRedirect("/samlite")

#start a new project
def make_project(request, digit):
	openingProject = projectOpen = False
	projectName = ""
	simsamuser = project = animation = simulation = None
	framesequence = spritecollection = []
	if request.user.is_authenticated():
		user = request.user
        	if hasattr(user, '_wrapped') and hasattr(user, '_setup'):
			if user._wrapped.__class__ == object:
				user._setup()
			user = user._wrapped
        	simsamuser = SimsamUser.objects.filter(user=user)[0]
	if request.POST:
		projectName = request.POST.get('projectName')
                if len(simsamuser.projects.filter(name=projectName)) > 0:
			# if the project name already exists, open it
			chooseproject(request, digit)
                else:
			# set up the new project			
			project = Project.objects.create(name=projectName, owner=simsamuser)
			animation = project.animations.create(name=projectName + "-anim" + str(0))
			simulation = project.simulations.create(name=projectName + "-sim" + str(0))    
			projectOpen = True           
	t = loader.get_template("samlite.html")
	c = RequestContext(request, {"project": project, "animation": animation, "projectOpen": projectOpen, "frame_sequence": framesequence, "sprite_collection": spritecollection, "openingProject": openingProject, "simulation": simulation, "simsamuser": simsamuser})
    	return HttpResponse(t.render(c))

def newanim(request):
	# add a new animation to the current project
	project = None
	framesequence = []
	spritecollection = []
        if request.POST:
		project = request.POST.get('project')
		numAnims = len(project.animations.all())
        	projectName = str(project.name)
		animation = project.animations.create(name=projectName + "-anim" + str(numAnims))
	t = loader.get_template("samlite.html")
	c = RequestContext(request, {"project": project, "animation": animation, "frame_sequence": framesequence, "sprite_collection": spritecollection})
    	return HttpResponse(t.render(c))
	#return HttpResponseRedirect('/samlite')
    	
def openproject(request, digit):
        # display the page listing current projects
 	if request.user.is_authenticated():
		user = request.user
        if hasattr(user, '_wrapped') and hasattr(user, '_setup'):
		if user._wrapped.__class__ == object:
			user._setup()
		user = user._wrapped
        simsamuser = SimsamUser.objects.filter(user=user)[0]
	projects = Project.objects.filter(owner=simsamuser)
    	t = loader.get_template("chooseproject.html")
    	c = RequestContext(request, {"projectList": projects})
	return HttpResponse(t.render(c))

def chooseproject(request, digit):
        # open the chosen project
	animations = []
        simsamuser = None
        project = None
        framesequence = []
        spritecollection = []
        animation = None
	if request.POST:
		projectname = request.POST.get("projectName")
                #simsamuser = request.POST.get("simsamuser")
 		if request.user.is_authenticated():
			user = request.user
        		if hasattr(user, '_wrapped') and hasattr(user, '_setup'):
				if user._wrapped.__class__ == object:
					user._setup()
			user = user._wrapped
       			simsamuser = SimsamUser.objects.filter(user=user)[0]
		project = Project.objects.get(name=projectname, owner=simsamuser)
		animations = project.animations.all()
        	if len(animations) > 0:
			# if there is an associated animation, open it
			animation = animations[0]
			fs = str(animation.frame_sequence)
                	sc = str(animation.sprite_collection)
			if len(fs) > 0:
				framesequence = fs.split(', ')
			if len(sc) > 0:
				spritecollection = sc.split(', ')
	# variables used to tell samlite.html what to display
	projectOpen = True 
	chooseProject = False
	openingProject = True
	t = loader.get_template("samlite.html")
    	c = RequestContext(request, {"project": project, "projectOpen": projectOpen, "chooseProject": chooseProject, "frame_sequence": framesequence, "sprite_collection": spritecollection, "openingProject": openingProject, "simsamuser": simsamuser, "animation": animation})
	#t.render(c)
   	return HttpResponse(t.render(c))		
		

	
