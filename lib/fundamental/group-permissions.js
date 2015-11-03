/**
 * Created by Michael on 2015/10/29.
 */
GroupPermission = {};
// 成员管理
GroupPermission.ApproveMembership = {name: "approve-membership"};
GroupPermission.OfferMembership = {name: "offer-membership", implications: [GroupPermission.ApproveMembership]};
GroupPermission.EditMember = {name: "edit-member"};
GroupPermission.ExpelMember = {name: "expel-member", implications: [GroupPermission.ApproveMembership]};

// 活动组织
GroupPermission.CreateEvent = {name: "create-event"};
GroupPermission.CreateOpenEvent = {name: "create-open-event", implications: [GroupPermission.CreateEvent]};
GroupPermission.ModifyEvent = {name: "modify-event", implications: [GroupPermission.CreateEvent]};

GroupPermission.CancelEvent = {name: "cancel-event", implications: [GroupPermission.CreateEvent]};
GroupPermission.DenyEntry = {name: "deny-entry", implications: [GroupPermission.CreateEvent]};
GroupPermission.BlockEntry = {name: "block-entry", implications: [GroupPermission.DenyEntry]};


groupPermissionMap = {};
_.each(GroupPermission, function (value) {
  groupPermissionMap[value.name] = value;
});

groupPermissionDependents = {};
_.each(GroupPermission, function (permission) {
  _.each(permission.implications, function (implicant) {
    var dependents = groupPermissionDependents[implicant.name];
    dependents = dependents || [];
    dependents.push(permission);
    groupPermissionDependents[implicant.name] = dependents;
  });
});

function addPermission(addedPermissions, permissionObj, addFunc) {
  if (_.contains(addedPermissions, permissionObj.name)) return;

  addFunc && addFunc(permissionObj.name);
  addedPermissions.push(permissionObj.name);

  _.each(permissionObj.implications, function (implication) {
    addPermission(addedPermissions, implication, addFunc);
  });
}

function removePermission(removedPermissions, permissionObj, removeFunc) {
  if (_.contains(removedPermissions, permissionObj.name)) return;

  removeFunc && removeFunc(permissionObj.name);
  removedPermissions.push(permissionObj.name);

  _.each(groupPermissionDependents[permissionObj.name], function (dependent) {
    removePermission(removedPermissions, dependent, removeFunc);
  });
}

GroupPermission.add = function (permission, addFunc) {
  if (typeof permission === "string") permission = groupPermissionMap[permission];
  if (!permission) return;
  addPermission([], permission, addFunc);
};

GroupPermission.remove = function (permission, removeFunc) {
  if (typeof permission === 'string') permission = groupPermissionMap[permission];
  if (!permission) return;
  removePermission([], permission, removeFunc);
};
