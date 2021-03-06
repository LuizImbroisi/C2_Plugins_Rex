﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Nickname = function(runtime)
{
	this.runtime = runtime;
};
cr.plugins_.Rex_Nickname.nickname2objtype = {};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Nickname.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{	    
	    this.nickname2objtype = cr.plugins_.Rex_Nickname.nickname2objtype;
	};
	
	instanceProto.create_insts = function (nickname,x,y,_layer)
	{
	    var obj_type = this.nickname2objtype[nickname];
        if (obj_type == null)
            return;
        var layer = (typeof _layer == "number")?
                    this.runtime.getLayerByNumber(_layer):
                    this.runtime.getLayerByName(_layer);  
        var inst = this.runtime.createInstance(obj_type, layer, x, y ); 
		
		this.runtime.isInOnDestroy++;
		this.runtime.trigger(Object.getPrototypeOf(obj_type.plugin).cnds.OnCreated, inst);
		this.runtime.isInOnDestroy--;
        
        // Pick just this instance
        obj_type.getCurrentSol().pick_one(inst);
        
	    return inst;
	}; 	

    instanceProto.PickAll = function (nickname, family_objtype)
	{
	    if (!family_objtype.is_family)
		    return;
	    var objtype = this.nickname2objtype[nickname];
        if (!objtype)
            return;
        if (family_objtype.members.indexOf(objtype) == -1)
            return;           
        var sol = objtype.getCurrentSol();    
        var sol_save = sol.select_all;   
        sol.select_all = true;
        var all_insts = sol.getObjects();
        var sol_family = family_objtype.getCurrentSol();  
        sol_family.instances = all_insts.slice();
        sol_family.select_all = false; 
        sol.select_all = sol_save;  
	};	
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.PickAll = function (nickname, family_objtype)
	{
	    this.PickAll(nickname, family_objtype);
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
	Acts.prototype.AssignNickname = function (nickname, objtype)
	{
        this.nickname2objtype[nickname] = objtype;
	};
	
	Acts.prototype.CreateInsts = function (nickname,x,y,_layer, family_objtype)
	{
        var inst = this.create_insts(nickname,x,y,_layer);
        if (inst == null)
            return;            
        if (!family_objtype)
            return;
        var objtype = this.nickname2objtype[nickname];
        if (family_objtype.members.indexOf(objtype) == -1)
            return; 
             
        family_objtype.getCurrentSol().pick_one(inst);
	};	

    Acts.prototype.PickAll = function (nickname, family_objtype)
	{
	    this.PickAll(nickname, family_objtype);    
	}; 
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());