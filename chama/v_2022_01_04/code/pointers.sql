-- 1. Register a group by collecting the following information
    -- 1.1 Intrinsic properties of the group i.e name,id, logo, etc
    -- as collected by the current version of outlook
    --
    -- The following 1.2,.3,.4, and .5 will be collected as pointers
    --
    -- 1.2 Collect the membership--
        --
        --1.2.1 List the members using a selector query
            create or replace view selector as 
            select
                --
                -- This is the primary key
                member.member as selector, 
                --
                -- this is a friendly component
                json_object(
                    "member",member.email,
                    "group",group.name
                ) as friend,
                --
                -- This is the member number within the group
                row_number() over(partition by member.group) as num,
                --
                -- Add the group FOREIGN KEY to simplify latter joins
                member.group
            from member
                inner join `group` on member.group=group.group;
        --
        --1.2.2 Formulate the membership view by extending the Group
        -- using the selector
        create or replace view membership as
        select
            count(selector.selector) as count,
            json_arrayagg(selector.friend limit 2 offset 0) as friends
        from selector
            inner join member on selector.selector= member.member
        group by member.group;
        









 Extend the group by the mem
            
        --
        --1.2.4 Filter to list the first two members
            create or replace view filter as
            select
                selector.selector as filter,
                selector.group,
                json_object(
                    "pk",selector.selector,
                    "friend",selector.friend
                ) as rich_friend
            from selector
            where selector.num<=2;
        --
        --1.2.5 Group the filtered members ie a maximum of 2
            create or replace view groupx as
            select
                filter.group as groupx,
                json_arrayagg(json_array(filter.rich_friend))as members
            from filter
            group by filter.group; 
        --
        --1.2.6 Formulate the pointer view
            create or replace view pointer as
            select
                `group`.`group` as pointer,
                json_object(
                    "count",membership.num,
                    "members",groupx.members
                )as member
            from `group`
                left join membership on membership.membership = group.group
                left join groupx on groupx.groupx = group.group;
        -- 1.2.7 Use the view to drive the pointer IO--
    -- 1.3 Collect the group objectives --
    -- 1.4 Collect the Officials --
    -- 1.5 Collect the events --