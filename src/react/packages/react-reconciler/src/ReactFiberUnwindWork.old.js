/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

import { resetWorkInProgressVersions as resetMutableSourceWorkInProgressVersions } from './ReactMutableSource.old';
import { ClassComponent, HostRoot, HostComponent, HostResource, HostSingleton, HostPortal, ContextProvider, SuspenseComponent, SuspenseListComponent, OffscreenComponent, LegacyHiddenComponent, CacheComponent, TracingMarkerComponent } from './ReactWorkTags';
import { DidCapture, NoFlags, ShouldCapture } from './ReactFiberFlags';
import { NoMode, ProfileMode } from './ReactTypeOfMode';
import { enableProfilerTimer, enableCache, enableTransitionTracing } from 'shared/ReactFeatureFlags';
import { popHostContainer, popHostContext } from './ReactFiberHostContext.old';
import { popSuspenseListContext, popSuspenseHandler } from './ReactFiberSuspenseContext.old';
import { popHiddenContext } from './ReactFiberHiddenContext.old';
import { resetHydrationState } from './ReactFiberHydrationContext.old';
import { isContextProvider as isLegacyContextProvider, popContext as popLegacyContext, popTopLevelContextObject as popTopLevelLegacyContextObject } from './ReactFiberContext.old';
import { popProvider } from './ReactFiberNewContext.old';
import { popCacheProvider } from './ReactFiberCacheComponent.old';
import { transferActualDuration } from './ReactProfilerTimer.old';
import { popTreeContext } from './ReactFiberTreeContext.old';
import { popRootTransition, popTransition } from './ReactFiberTransition.old';
import { popMarkerInstance, popRootMarkerInstance } from './ReactFiberTracingMarkerComponent.old';
function unwindWork(current, workInProgress, renderLanes) {
  // Note: This intentionally doesn't check if we're hydrating because comparing
  // to the current tree provider fiber is just as fast and less error-prone.
  // Ideally we would have a special version of the work loop only
  // for hydration.
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case ClassComponent:
      {
        const Component = workInProgress.type;
        if (isLegacyContextProvider(Component)) {
          popLegacyContext(workInProgress);
        }
        const flags = workInProgress.flags;
        if (flags & ShouldCapture) {
          workInProgress.flags = flags & ~ShouldCapture | DidCapture;
          if (enableProfilerTimer && (workInProgress.mode & ProfileMode) !== NoMode) {
            transferActualDuration(workInProgress);
          }
          return workInProgress;
        }
        return null;
      }
    case HostRoot:
      {
        const root = workInProgress.stateNode;
        if (enableCache) {
          const cache = workInProgress.memoizedState.cache;
          popCacheProvider(workInProgress, cache);
        }
        if (enableTransitionTracing) {
          popRootMarkerInstance(workInProgress);
        }
        popRootTransition(workInProgress, root, renderLanes);
        popHostContainer(workInProgress);
        popTopLevelLegacyContextObject(workInProgress);
        resetMutableSourceWorkInProgressVersions();
        const flags = workInProgress.flags;
        if ((flags & ShouldCapture) !== NoFlags && (flags & DidCapture) === NoFlags) {
          // There was an error during render that wasn't captured by a suspense
          // boundary. Do a second pass on the root to unmount the children.
          workInProgress.flags = flags & ~ShouldCapture | DidCapture;
          return workInProgress;
        }
        // We unwound to the root without completing it. Exit.
        return null;
      }
    case HostResource:
    case HostSingleton:
    case HostComponent:
      {
        // TODO: popHydrationState
        popHostContext(workInProgress);
        return null;
      }
    case SuspenseComponent:
      {
        popSuspenseHandler(workInProgress);
        const suspenseState = workInProgress.memoizedState;
        if (suspenseState !== null && suspenseState.dehydrated !== null) {
          if (workInProgress.alternate === null) {
            throw new Error('Threw in newly mounted dehydrated component. This is likely a bug in ' + 'React. Please file an issue.');
          }
          resetHydrationState();
        }
        const flags = workInProgress.flags;
        if (flags & ShouldCapture) {
          workInProgress.flags = flags & ~ShouldCapture | DidCapture;
          // Captured a suspense effect. Re-render the boundary.
          if (enableProfilerTimer && (workInProgress.mode & ProfileMode) !== NoMode) {
            transferActualDuration(workInProgress);
          }
          return workInProgress;
        }
        return null;
      }
    case SuspenseListComponent:
      {
        popSuspenseListContext(workInProgress);
        // SuspenseList doesn't actually catch anything. It should've been
        // caught by a nested boundary. If not, it should bubble through.
        return null;
      }
    case HostPortal:
      popHostContainer(workInProgress);
      return null;
    case ContextProvider:
      const context = workInProgress.type._context;
      popProvider(context, workInProgress);
      return null;
    case OffscreenComponent:
    case LegacyHiddenComponent:
      {
        popSuspenseHandler(workInProgress);
        popHiddenContext(workInProgress);
        popTransition(workInProgress, current);
        const flags = workInProgress.flags;
        if (flags & ShouldCapture) {
          workInProgress.flags = flags & ~ShouldCapture | DidCapture;
          // Captured a suspense effect. Re-render the boundary.
          if (enableProfilerTimer && (workInProgress.mode & ProfileMode) !== NoMode) {
            transferActualDuration(workInProgress);
          }
          return workInProgress;
        }
        return null;
      }
    case CacheComponent:
      if (enableCache) {
        const cache = workInProgress.memoizedState.cache;
        popCacheProvider(workInProgress, cache);
      }
      return null;
    case TracingMarkerComponent:
      if (enableTransitionTracing) {
        if (workInProgress.stateNode !== null) {
          popMarkerInstance(workInProgress);
        }
      }
      return null;
    default:
      return null;
  }
}
function unwindInterruptedWork(current, interruptedWork, renderLanes) {
  // Note: This intentionally doesn't check if we're hydrating because comparing
  // to the current tree provider fiber is just as fast and less error-prone.
  // Ideally we would have a special version of the work loop only
  // for hydration.
  popTreeContext(interruptedWork);
  switch (interruptedWork.tag) {
    case ClassComponent:
      {
        const childContextTypes = interruptedWork.type.childContextTypes;
        if (childContextTypes !== null && childContextTypes !== undefined) {
          popLegacyContext(interruptedWork);
        }
        break;
      }
    case HostRoot:
      {
        const root = interruptedWork.stateNode;
        if (enableCache) {
          const cache = interruptedWork.memoizedState.cache;
          popCacheProvider(interruptedWork, cache);
        }
        if (enableTransitionTracing) {
          popRootMarkerInstance(interruptedWork);
        }
        popRootTransition(interruptedWork, root, renderLanes);
        popHostContainer(interruptedWork);
        popTopLevelLegacyContextObject(interruptedWork);
        resetMutableSourceWorkInProgressVersions();
        break;
      }
    case HostResource:
    case HostSingleton:
    case HostComponent:
      {
        popHostContext(interruptedWork);
        break;
      }
    case HostPortal:
      popHostContainer(interruptedWork);
      break;
    case SuspenseComponent:
      popSuspenseHandler(interruptedWork);
      break;
    case SuspenseListComponent:
      popSuspenseListContext(interruptedWork);
      break;
    case ContextProvider:
      const context = interruptedWork.type._context;
      popProvider(context, interruptedWork);
      break;
    case OffscreenComponent:
    case LegacyHiddenComponent:
      popSuspenseHandler(interruptedWork);
      popHiddenContext(interruptedWork);
      popTransition(interruptedWork, current);
      break;
    case CacheComponent:
      if (enableCache) {
        const cache = interruptedWork.memoizedState.cache;
        popCacheProvider(interruptedWork, cache);
      }
      break;
    case TracingMarkerComponent:
      if (enableTransitionTracing) {
        const instance = interruptedWork.stateNode;
        if (instance !== null) {
          popMarkerInstance(interruptedWork);
        }
      }
      break;
    default:
      break;
  }
}
export { unwindWork, unwindInterruptedWork };