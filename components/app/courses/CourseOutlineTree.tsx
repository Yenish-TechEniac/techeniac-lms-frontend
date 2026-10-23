'use client';

import React, { useState } from 'react';

import type { Assignment, Course, Topic } from '@/types/courses';

import { ActiveNodeSelection } from './types';

interface CourseOutlineTreeProps {
  course: Course;
  selectedNode: ActiveNodeSelection;
  reorderingId?: string | null;
  onSelectNode: (selection: ActiveNodeSelection) => void;
  onAddTopic: () => void;
  onAddSubtopic: (topicId: string) => void;
  onAddTopicAssignment: (topicId: string) => void;
  onAddCourseAssignment: () => void;
  onReorderTopics: (targetTopicId: string, topicIdsInOrder: string[]) => void;
  onReorderSubtopics: (
    targetSubtopicId: string,
    topicId: string,
    subtopicIdsInOrder: string[],
  ) => void;
  onReorderAssignments: (targetAssignmentId: string, assignmentIdsInOrder: string[]) => void;
  onRequestDeleteNode: (
    type: 'TOPIC' | 'SUBTOPIC' | 'ASSIGNMENT',
    id: string,
    title: string,
  ) => void;
}

export function CourseOutlineTree({
  course,
  selectedNode,
  reorderingId,
  onSelectNode,
  onAddTopic,
  onAddSubtopic,
  onAddTopicAssignment,
  onAddCourseAssignment,
  onReorderTopics,
  onReorderSubtopics,
  onReorderAssignments,
  onRequestDeleteNode,
}: CourseOutlineTreeProps) {
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const toggleCollapse = (topicId: string) => {
    setCollapsedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const topics = [...(course.topics || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const courseAssignments = [...(course.courseAssignments || course.assignments || [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  // Keyboard reorder helpers
  const handleMoveTopic = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;
    const reordered = [...topics];
    const current = reordered[index];
    const target = reordered[targetIndex];
    if (!current || !target) return;
    reordered[index] = target;
    reordered[targetIndex] = current;
    onReorderTopics(
      current.id,
      reordered.map((t) => t.id),
    );
  };

  const handleMoveSubtopic = (topic: Topic, index: number, direction: 'up' | 'down') => {
    const subtopics = [...(topic.subtopics || [])].sort((a, b) => a.displayOrder - b.displayOrder);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subtopics.length) return;
    const reordered = [...subtopics];
    const current = reordered[index];
    const target = reordered[targetIndex];
    if (!current || !target) return;
    reordered[index] = target;
    reordered[targetIndex] = current;
    onReorderSubtopics(
      current.id,
      topic.id,
      reordered.map((s) => s.id),
    );
  };

  const handleMoveAssignment = (list: Assignment[], index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const reordered = [...list];
    const current = reordered[index];
    const target = reordered[targetIndex];
    if (!current || !target) return;
    reordered[index] = target;
    reordered[targetIndex] = current;
    onReorderAssignments(
      current.id,
      reordered.map((a) => a.id),
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-b border-slate-200 bg-slate-50/50 lg:border-r lg:border-b-0">
      {/* Outline Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Curriculum Structure
          </span>
          <h2 className="text-sm font-bold text-slate-900">Course Outline</h2>
        </div>
        <button
          type="button"
          onClick={onAddTopic}
          title="Add a new topic to this course"
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          + Topic
        </button>
      </div>

      {/* Tree Content */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {/* Course Root Item */}
        <div
          onClick={() => onSelectNode({ type: 'COURSE', id: course.id })}
          className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            selectedNode.type === 'COURSE' && selectedNode.id === course.id
              ? 'border border-blue-200 bg-blue-50 text-blue-900 shadow-xs'
              : 'border border-transparent bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[10px] text-slate-400">ROOT</span>
            <span className="truncate">{course.title}</span>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${course.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
          />
        </div>

        {/* Course-level Assignments Section */}
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Course-Level Assignments ({courseAssignments.length})</span>
            <button
              type="button"
              onClick={onAddCourseAssignment}
              className="text-[10px] text-blue-600 hover:underline"
            >
              + Task
            </button>
          </div>

          <div className="mt-1.5 space-y-1">
            {courseAssignments.map((assignment, idx) => {
              const isSelected =
                selectedNode.type === 'ASSIGNMENT' && selectedNode.id === assignment.id;
              return (
                <div
                  key={assignment.id}
                  className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? 'border border-blue-300 bg-blue-50/80 font-semibold text-blue-900'
                      : 'border border-transparent text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    onClick={() => onSelectNode({ type: 'ASSIGNMENT', id: assignment.id })}
                    className="flex flex-1 cursor-pointer items-center gap-1.5 truncate"
                  >
                    <span className="font-mono text-[10px] text-purple-600">T</span>
                    <span className="truncate">{assignment.title}</span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                    {reorderingId === assignment.id ? (
                      <span className="inline-flex items-center px-1">
                        <span className="h-2.5 w-2.5 animate-spin rounded-full border border-purple-600 border-t-transparent" />
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(reorderingId) || idx === 0}
                          onClick={() => handleMoveAssignment(courseAssignments, idx, 'up')}
                          title="Move Up"
                          className="rounded p-0.5 text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20"
                        >
                          &uarr;
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(reorderingId) || idx === courseAssignments.length - 1}
                          onClick={() => handleMoveAssignment(courseAssignments, idx, 'down')}
                          title="Move Down"
                          className="rounded p-0.5 text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20"
                        >
                          &darr;
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={Boolean(reorderingId)}
                      onClick={() =>
                        onRequestDeleteNode('ASSIGNMENT', assignment.id, assignment.title)
                      }
                      title="Delete assignment"
                      className="rounded p-0.5 text-[10px] text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topics List */}
        {topics.map((topic, topicIdx) => {
          const isCollapsed = collapsedTopics[topic.id] ?? false;
          const isSelected = selectedNode.type === 'TOPIC' && selectedNode.id === topic.id;
          const subtopics = [...(topic.subtopics || [])].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );
          const topicAssignments = [...(topic.assignments || [])].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );

          return (
            <div
              key={topic.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
            >
              {/* Topic Item Bar */}
              <div
                className={`group flex items-center justify-between px-3 py-2 transition-colors ${
                  isSelected ? 'border-b border-blue-200 bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-1 items-center gap-1.5 truncate">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(topic.id)}
                    className="px-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    {isCollapsed ? '+' : '–'}
                  </button>
                  <div
                    onClick={() => onSelectNode({ type: 'TOPIC', id: topic.id })}
                    className="flex-1 cursor-pointer truncate"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          topic.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span className="truncate text-xs font-bold text-slate-900">
                        {topic.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {reorderingId === topic.id ? (
                    <span className="inline-flex items-center px-1">
                      <span className="h-3 w-3 animate-spin rounded-full border border-blue-600 border-t-transparent" />
                    </span>
                  ) : (
                    <>
                      {/* Keyboard Reorder Up / Down */}
                      <button
                        type="button"
                        disabled={Boolean(reorderingId) || topicIdx === 0}
                        onClick={() => handleMoveTopic(topicIdx, 'up')}
                        title="Move Topic Up"
                        className="rounded p-0.5 text-[11px] text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                      >
                        &uarr;
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(reorderingId) || topicIdx === topics.length - 1}
                        onClick={() => handleMoveTopic(topicIdx, 'down')}
                        title="Move Topic Down"
                        className="rounded p-0.5 text-[11px] text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                      >
                        &darr;
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={Boolean(reorderingId)}
                    onClick={() => onAddSubtopic(topic.id)}
                    title="Add Subtopic"
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
                  >
                    + Sub
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(reorderingId)}
                    onClick={() => onAddTopicAssignment(topic.id)}
                    title="Add Assignment to this Topic"
                    className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-40"
                  >
                    + Task
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(reorderingId)}
                    onClick={() => onRequestDeleteNode('TOPIC', topic.id, topic.title)}
                    title="Delete Topic"
                    className="rounded p-0.5 text-[11px] text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Subtopics & Topic Assignments */}
              {!isCollapsed && (
                <div className="space-y-1 border-t border-slate-100 bg-slate-50/40 p-2">
                  {/* Subtopics */}
                  {subtopics.map((subtopic, sIdx) => {
                    const isSubSelected =
                      selectedNode.type === 'SUBTOPIC' && selectedNode.id === subtopic.id;
                    return (
                      <div
                        key={subtopic.id}
                        className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          isSubSelected
                            ? 'border border-blue-300 bg-blue-50 font-semibold text-blue-900 shadow-xs'
                            : 'border border-transparent bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div
                          onClick={() =>
                            onSelectNode({
                              type: 'SUBTOPIC',
                              id: subtopic.id,
                              parentTopicId: topic.id,
                            })
                          }
                          className="flex flex-1 cursor-pointer items-center gap-1.5 truncate"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              subtopic.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className="truncate">{subtopic.title}</span>
                        </div>

                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                          {reorderingId === subtopic.id ? (
                            <span className="inline-flex items-center px-1">
                              <span className="h-2.5 w-2.5 animate-spin rounded-full border border-blue-600 border-t-transparent" />
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={Boolean(reorderingId) || sIdx === 0}
                                onClick={() => handleMoveSubtopic(topic, sIdx, 'up')}
                                title="Move Subtopic Up"
                                className="rounded p-0.5 text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                              >
                                &uarr;
                              </button>
                              <button
                                type="button"
                                disabled={Boolean(reorderingId) || sIdx === subtopics.length - 1}
                                onClick={() => handleMoveSubtopic(topic, sIdx, 'down')}
                                title="Move Subtopic Down"
                                className="rounded p-0.5 text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                              >
                                &darr;
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            disabled={Boolean(reorderingId)}
                            onClick={() =>
                              onRequestDeleteNode('SUBTOPIC', subtopic.id, subtopic.title)
                            }
                            title="Delete Subtopic"
                            className="rounded p-0.5 text-[10px] text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Topic Assignments */}
                  {topicAssignments.map((tAssign, aIdx) => {
                    const isAssignSelected =
                      selectedNode.type === 'ASSIGNMENT' && selectedNode.id === tAssign.id;
                    return (
                      <div
                        key={tAssign.id}
                        className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          isAssignSelected
                            ? 'border border-purple-300 bg-purple-50 font-semibold text-purple-900 shadow-xs'
                            : 'border border-transparent bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div
                          onClick={() =>
                            onSelectNode({
                              type: 'ASSIGNMENT',
                              id: tAssign.id,
                              parentTopicId: topic.id,
                            })
                          }
                          className="flex flex-1 cursor-pointer items-center gap-1.5 truncate"
                        >
                          <span className="text-[10px] font-bold text-purple-700 uppercase">
                            [TASK]
                          </span>
                          <span className="truncate">{tAssign.title}</span>
                        </div>

                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                          {reorderingId === tAssign.id ? (
                            <span className="inline-flex items-center px-1">
                              <span className="h-2.5 w-2.5 animate-spin rounded-full border border-purple-600 border-t-transparent" />
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={Boolean(reorderingId) || aIdx === 0}
                                onClick={() => handleMoveAssignment(topicAssignments, aIdx, 'up')}
                                title="Move Assignment Up"
                                className="rounded p-0.5 text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                              >
                                &uarr;
                              </button>
                              <button
                                type="button"
                                disabled={
                                  Boolean(reorderingId) || aIdx === topicAssignments.length - 1
                                }
                                onClick={() => handleMoveAssignment(topicAssignments, aIdx, 'down')}
                                title="Move Assignment Down"
                                className="rounded p-0.5 text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                              >
                                &darr;
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            disabled={Boolean(reorderingId)}
                            onClick={() =>
                              onRequestDeleteNode('ASSIGNMENT', tAssign.id, tAssign.title)
                            }
                            title="Delete Assignment"
                            className="rounded p-0.5 text-[10px] text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
